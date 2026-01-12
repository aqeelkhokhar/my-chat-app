import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CallOverlay } from '../components/CallOverlay';
import {
  VideoCallIcon,
  GroupIcon,
  SendIcon,
  ChatIcon,
  CameraIcon,
  ImageIcon,
  PlusIcon,
} from '../components/CallIcons';
import { pickImageFromGallery, takePhoto } from '../services/imagePicker';
import { uploadProfilePhoto, uploadChatPhoto } from '../services/cloudinary';
import { useChat } from '../hooks/useChat';
import { useNotifications } from '../hooks/useNotifications';
import { useUserId } from '../hooks/useUserId';
import { useWebRTCCall } from '../hooks/useWebRTCCall';
import { styles } from '../styles/chatStyles';
import type { ChatMessage } from '../types/chat';

function hashToColor(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) % 1000000007;
  }
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 50%)`;
}

function userLabel(userId: string) {
  const normalized = userId.trim();
  if (normalized.length <= 8) {
    return normalized;
  }
  return normalized.slice(-6);
}

type ChatMode = 'single' | 'group';

export function ChatScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatMessage> | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>(
    [],
  );
  const [chatMode, setChatMode] = useState<ChatMode>('single');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showCallOptions, setShowCallOptions] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const { userId } = useUserId();

  const {
    mode: callMode,
    peerUserId,
    incomingCall,
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoOff,
    startCall,
    acceptIncoming,
    rejectIncoming,
    endCall,
    toggleAudio,
    toggleVideo,
    flipCamera,
  } = useWebRTCCall(userId);

  const { showNotification } = useNotifications();
  const {
    input,
    setInput,
    messages,
    sendMessage,
    headerText,
    onlineUsers,
    unreadByUserId,
    metaByUserId,
  } = useChat(showNotification, userId, selectedUserId ?? '');

  const otherUsers = onlineUsers.filter(u => u !== userId);

  const conversationMessages = messages.filter(m => {
    if (!userId) return false;

    if (chatMode === 'single' && selectedUserId) {
      const from = m.fromUserId;
      const to = m.toUserId;
      if (!from || !to) return false;
      const isMineToThem = from === userId && to === selectedUserId;
      const isTheirsToMe = from === selectedUserId && to === userId;
      return isMineToThem || isTheirsToMe;
    }

    if (chatMode === 'group' && selectedGroupMembers.length > 0) {
      const from = m.fromUserId;
      const to = m.toUserId;
      if (!from || !to) return false;
      const isFromGroup =
        selectedGroupMembers.includes(from) || from === userId;
      const isToGroup = selectedGroupMembers.includes(to) || to === userId;
      return isFromGroup && isToGroup;
    }

    return false;
  });

  useEffect(() => {
    if (conversationMessages.length === 0) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [conversationMessages.length]);

  const handleSelectUser = (u: string) => {
    if (chatMode === 'group') {
      setSelectedGroupMembers(prev =>
        prev.includes(u) ? prev.filter(id => id !== u) : [...prev, u],
      );
    } else {
      setSelectedUserId(u);
      setSelectedGroupMembers([]);
    }
  };

  const handleStartGroupChat = () => {
    if (selectedGroupMembers.length > 0) {
      setChatMode('group');
      setSelectedUserId(null);
      setShowGroupModal(false);
    }
  };

  const handleBackToSingle = () => {
    setChatMode('single');
    setSelectedGroupMembers([]);
  };

  const toggleGroupMember = (u: string) => {
    setSelectedGroupMembers(prev =>
      prev.includes(u) ? prev.filter(id => id !== u) : [...prev, u],
    );
  };

  const canCall =
    !!userId && (!!selectedUserId || selectedGroupMembers.length > 0);
  const callPeerLabel = peerUserId
    ? userLabel(peerUserId)
    : selectedUserId
    ? userLabel(selectedUserId)
    : selectedGroupMembers.length > 0
    ? `${selectedGroupMembers.length} members`
    : 'User';

  const currentChatLabel =
    chatMode === 'group' && selectedGroupMembers.length > 0
      ? `Group (${selectedGroupMembers.length})`
      : selectedUserId
      ? userLabel(selectedUserId)
      : 'Messages';

  const handleVideoCall = () => {
    setShowCallOptions(false);
    if (chatMode === 'group' && selectedGroupMembers.length > 0) {
      startCall({ toUserId: selectedGroupMembers[0], isVideo: true });
    } else if (selectedUserId) {
      startCall({ toUserId: selectedUserId, isVideo: true });
    }
  };

  const handleAudioCall = () => {
    setShowCallOptions(false);
    if (chatMode === 'group' && selectedGroupMembers.length > 0) {
      startCall({ toUserId: selectedGroupMembers[0], isVideo: false });
    } else if (selectedUserId) {
      startCall({ toUserId: selectedUserId, isVideo: false });
    }
  };

  const handlePickFromGallery = async () => {
    setShowImagePicker(false);
    const result = await pickImageFromGallery();
    if (result.success && result.uri) {
      await handleImageUpload(result.uri);
    }
  };

  const handleTakePhoto = async () => {
    setShowImagePicker(false);
    const result = await takePhoto();
    if (result.success && result.uri) {
      await handleImageUpload(result.uri);
    }
  };

  const handleImageUpload = async (uri: string) => {
    if (!userId || (!selectedUserId && selectedGroupMembers.length === 0)) {
      Alert.alert('Error', 'Please select a chat first');
      return;
    }

    setIsUploadingImage(true);
    try {
      const chatId = selectedUserId || selectedGroupMembers.sort().join('_');
      const downloadUrl = await uploadChatPhoto(userId, chatId, uri);

      // Send the image as a message
      sendMessage(downloadUrl, true);
    } catch (error) {
      console.error('Failed to upload image:', error);
      Alert.alert(
        'Upload Failed',
        'Could not upload the image. Please try again.',
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleProfilePhotoChange = async () => {
    const result = await pickImageFromGallery();
    if (result.success && result.uri && userId) {
      try {
        const downloadUrl = await uploadProfilePhoto(userId, result.uri);
        setProfilePhoto(downloadUrl);
      } catch (error) {
        console.error('Failed to upload profile photo:', error);
        Alert.alert('Upload Failed', 'Could not update profile photo.');
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: safeAreaInsets.top + 12 }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>{currentChatLabel}</Text>
            <Text style={styles.headerSubtitle}>{headerText}</Text>
          </View>
          <View style={styles.headerActions}>
            {canCall && (
              <Pressable
                style={({ pressed }) => [
                  styles.headerCallButton,
                  pressed && styles.headerCallButtonPressed,
                ]}
                onPress={handleVideoCall}
              >
                <VideoCallIcon size={18} color="#FFFFFF" />
                <Text style={styles.headerCallButtonText}>Call</Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [
                styles.headerIconButton,
                pressed && styles.headerIconButtonPressed,
              ]}
              onPress={() => setShowGroupModal(true)}
            >
              <GroupIcon size={22} color="#A1A1AA" />
            </Pressable>
            <Pressable
              style={styles.profileAvatarContainer}
              onPress={handleProfilePhotoChange}
            >
              {profilePhoto ? (
                <Image
                  source={{ uri: profilePhoto }}
                  style={styles.profileImage}
                />
              ) : (
                <View
                  style={[
                    styles.meAvatar,
                    { backgroundColor: hashToColor(userId ?? 'ME') },
                  ]}
                >
                  <Text style={styles.meAvatarText}>
                    {userId ? userId.slice(-2).toUpperCase() : 'ME'}
                  </Text>
                </View>
              )}
              <View style={styles.profileAvatarEdit}>
                <CameraIcon size={12} color="#FFFFFF" />
              </View>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Group Header when in group mode */}
      {chatMode === 'group' && selectedGroupMembers.length > 0 && (
        <Pressable style={styles.groupHeader} onPress={handleBackToSingle}>
          <View style={styles.groupAvatarStack}>
            {selectedGroupMembers.slice(0, 3).map((member, index) => (
              <View
                key={member}
                style={[
                  styles.groupAvatarStacked,
                  {
                    backgroundColor: hashToColor(member),
                    marginLeft: index === 0 ? 0 : -8,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.groupInfo}>
            <Text style={styles.groupName}>Group Chat</Text>
            <Text style={styles.groupMembers}>
              {selectedGroupMembers.map(m => userLabel(m)).join(', ')}
            </Text>
          </View>
        </Pressable>
      )}

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={safeAreaInsets.top}
      >
        {/* Online Users Section */}
        <View style={styles.onlineSection}>
          <View style={styles.onlineHeaderRow}>
            <Text style={styles.onlineTitle}>Online Now</Text>
            <Text style={styles.onlineCount}>{otherUsers.length}</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.onlineUsersRow}
          >
            {otherUsers.map(u => {
              const isSelected =
                chatMode === 'single'
                  ? u === selectedUserId
                  : selectedGroupMembers.includes(u);
              const unread = unreadByUserId[u] ?? 0;
              const preview = metaByUserId[u]?.lastText;
              return (
                <Pressable
                  key={u}
                  onPress={() => handleSelectUser(u)}
                  style={({ pressed }) => [
                    styles.userItem,
                    isSelected && styles.userItemSelected,
                    pressed && styles.userItemPressed,
                  ]}
                >
                  <View style={styles.userAvatarWrap}>
                    <View
                      style={[
                        styles.userAvatar,
                        { backgroundColor: hashToColor(u) },
                      ]}
                    />
                    {unread > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>
                          {unread > 99 ? '99+' : String(unread)}
                        </Text>
                      </View>
                    )}
                    <View style={styles.userOnlineDot} />
                  </View>
                  <Text numberOfLines={1} style={styles.userName}>
                    {userLabel(u)}
                  </Text>
                </Pressable>
              );
            })}
            {otherUsers.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No users online</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Messages */}
        {selectedUserId || selectedGroupMembers.length > 0 ? (
          <FlatList
            ref={listRef}
            contentContainerStyle={styles.listContent}
            data={conversationMessages}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const isMe = item.from === 'me';
              const isImage =
                item.imageUrl ||
                (item.text && item.text.startsWith('https://firebasestorage'));

              return (
                <View
                  style={[
                    styles.messageRow,
                    isMe ? styles.messageRowRight : styles.messageRowLeft,
                  ]}
                >
                  {isImage ? (
                    <Pressable
                      style={[
                        styles.bubble,
                        isMe ? styles.bubbleMe : styles.bubbleOther,
                        { padding: 4 },
                      ]}
                    >
                      <Image
                        source={{ uri: item.imageUrl || item.text }}
                        style={styles.messageImage}
                        resizeMode="cover"
                      />
                    </Pressable>
                  ) : (
                    <View
                      style={[
                        styles.bubble,
                        isMe ? styles.bubbleMe : styles.bubbleOther,
                      ]}
                    >
                      <Text style={styles.messageText}>{item.text}</Text>
                    </View>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIcon}>
                  <ChatIcon size={36} color="#71717A" />
                </View>
                <Text style={styles.emptyStateTitle}>No messages yet</Text>
                <Text style={styles.emptyStateText}>
                  Start the conversation by sending a message
                </Text>
              </View>
            }
          />
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <ChatIcon size={36} color="#71717A" />
            </View>
            <Text style={styles.emptyStateTitle}>Select a chat</Text>
            <Text style={styles.emptyStateText}>
              Choose someone from the online users above to start chatting
            </Text>
          </View>
        )}

        {/* Composer */}
        <View
          style={[
            styles.composer,
            { paddingBottom: Math.max(safeAreaInsets.bottom, 16) },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.attachButton,
              pressed && styles.attachButtonPressed,
            ]}
            onPress={() => setShowImagePicker(true)}
            disabled={!(selectedUserId || selectedGroupMembers.length > 0)}
          >
            <PlusIcon
              size={22}
              color={
                selectedUserId || selectedGroupMembers.length > 0
                  ? '#A1A1AA'
                  : '#52525B'
              }
            />
          </Pressable>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={
              selectedUserId || selectedGroupMembers.length > 0
                ? 'Type a message...'
                : 'Select a user to chat'
            }
            placeholderTextColor="#71717A"
            style={[
              styles.input,
              !(selectedUserId || selectedGroupMembers.length > 0) &&
                styles.inputDisabled,
            ]}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage()}
            editable={!!(selectedUserId || selectedGroupMembers.length > 0)}
            multiline
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              !(selectedUserId || selectedGroupMembers.length > 0) &&
                styles.sendButtonDisabled,
              pressed && styles.sendButtonPressed,
            ]}
            onPress={
              selectedUserId || selectedGroupMembers.length > 0
                ? () => sendMessage()
                : undefined
            }
          >
            <SendIcon size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Group Selection Modal */}
      <Modal
        visible={showGroupModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGroupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Group Chat</Text>
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setShowGroupModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.modalList}>
              {otherUsers.map(u => {
                const isSelected = selectedGroupMembers.includes(u);
                return (
                  <Pressable
                    key={u}
                    style={[
                      styles.modalUserItem,
                      isSelected && styles.modalUserItemSelected,
                    ]}
                    onPress={() => toggleGroupMember(u)}
                  >
                    <View
                      style={[
                        styles.modalUserAvatar,
                        { backgroundColor: hashToColor(u) },
                      ]}
                    />
                    <Text style={styles.modalUserName}>{userLabel(u)}</Text>
                    <View
                      style={[
                        styles.modalCheckbox,
                        isSelected && styles.modalCheckboxSelected,
                      ]}
                    >
                      {isSelected && (
                        <Text style={styles.modalCheckmark}>✓</Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
              {otherUsers.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No users online to add to group
                  </Text>
                </View>
              )}
            </ScrollView>
            <View style={styles.modalFooter}>
              <Pressable
                style={[
                  styles.modalButton,
                  selectedGroupMembers.length === 0 &&
                    styles.modalButtonDisabled,
                ]}
                onPress={handleStartGroupChat}
                disabled={selectedGroupMembers.length === 0}
              >
                <Text style={styles.modalButtonText}>
                  Start Group Chat ({selectedGroupMembers.length})
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <Pressable
          style={styles.imagePickerOverlay}
          onPress={() => setShowImagePicker(false)}
        >
          <View style={styles.imagePickerContent}>
            <View style={styles.imagePickerHandle} />
            <Pressable
              style={({ pressed }) => [
                styles.imagePickerOption,
                pressed && styles.imagePickerOptionPressed,
              ]}
              onPress={handleTakePhoto}
            >
              <View style={styles.imagePickerIcon}>
                <CameraIcon size={24} color="#6366F1" />
              </View>
              <Text style={styles.imagePickerText}>Take Photo</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.imagePickerOption,
                pressed && styles.imagePickerOptionPressed,
              ]}
              onPress={handlePickFromGallery}
            >
              <View style={styles.imagePickerIcon}>
                <ImageIcon size={24} color="#6366F1" />
              </View>
              <Text style={styles.imagePickerText}>Choose from Gallery</Text>
            </Pressable>
            <Pressable
              style={styles.imagePickerCancel}
              onPress={() => setShowImagePicker(false)}
            >
              <Text style={styles.imagePickerCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Upload Progress Overlay */}
      {isUploadingImage && (
        <View style={styles.uploadProgress}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.uploadProgressText}>Uploading...</Text>
        </View>
      )}

      {/* Call Overlay */}
      <CallOverlay
        visible={callMode !== 'idle'}
        mode={callMode}
        peerLabel={callPeerLabel}
        incomingCall={incomingCall}
        localStream={localStream}
        remoteStream={remoteStream}
        isAudioMuted={isAudioMuted}
        isVideoOff={isVideoOff}
        onAccept={acceptIncoming}
        onReject={rejectIncoming}
        onEnd={() => endCall('user_hangup')}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onFlipCamera={flipCamera}
      />
    </View>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
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
} from '../components/CallIcons';
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
              return (
                <View
                  style={[
                    styles.messageRow,
                    isMe ? styles.messageRowRight : styles.messageRowLeft,
                  ]}
                >
                  <View
                    style={[
                      styles.bubble,
                      isMe ? styles.bubbleMe : styles.bubbleOther,
                    ]}
                  >
                    <Text style={styles.messageText}>{item.text}</Text>
                  </View>
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
            onSubmitEditing={sendMessage}
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
                ? sendMessage
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

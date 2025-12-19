import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CallOverlay } from '../components/CallOverlay';
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
  return `hsl(${hue}, 55%, 45%)`;
}

function userLabel(userId: string) {
  const normalized = userId.trim();
  if (normalized.length <= 6) {
    return normalized;
  }
  return `User ${normalized.slice(-4)}`;
}

export function ChatScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatMessage> | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { userId } = useUserId();

  const {
    mode: callMode,
    peerUserId,
    incomingCall,
    localStream,
    remoteStream,
    startCall,
    acceptIncoming,
    rejectIncoming,
    endCall,
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

  const conversationMessages = messages.filter(m => {
    if (!userId || !selectedUserId) {
      return false;
    }

    const from = m.fromUserId;
    const to = m.toUserId;
    if (!from || !to) {
      return false;
    }

    const isMineToThem = from === userId && to === selectedUserId;
    const isTheirsToMe = from === selectedUserId && to === userId;
    return isMineToThem || isTheirsToMe;
  });

  useEffect(() => {
    if (conversationMessages.length === 0) {
      return;
    }

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [conversationMessages.length]);

  const canCall = !!userId && !!selectedUserId;
  const callPeerLabel = peerUserId
    ? userLabel(peerUserId)
    : selectedUserId
    ? userLabel(selectedUserId)
    : 'User';

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop: safeAreaInsets.top,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>
              {selectedUserId ? userLabel(selectedUserId) : 'Chats'}
            </Text>
            <Text style={styles.headerSubtitle}>{headerText}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              style={({ pressed }) => [
                styles.headerCallButton,
                !canCall ? styles.headerCallButtonDisabled : null,
                pressed ? styles.headerCallButtonPressed : null,
              ]}
              onPress={
                canCall
                  ? () =>
                      startCall({ toUserId: selectedUserId!, isVideo: true })
                  : undefined
              }
            >
              <Text style={styles.headerCallButtonText}>Call</Text>
            </Pressable>

            <View
              style={[
                styles.meAvatar,
                {
                  backgroundColor: hashToColor(userId ?? 'ME'),
                },
              ]}
            >
              <Text style={styles.meAvatarText}>Me</Text>
            </View>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={safeAreaInsets.top}
      >
        <View style={styles.onlineSection}>
          <View style={styles.onlineHeaderRow}>
            <Text style={styles.onlineTitle}>Online</Text>
            <Text style={styles.onlineCount}>
              {Math.max(onlineUsers.filter(u => u !== userId).length, 0)}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.onlineUsersRow}
          >
            {onlineUsers
              .filter(u => u !== userId)
              .map(u => {
                const isSelected = u === selectedUserId;
                const unread = unreadByUserId[u] ?? 0;
                const preview = metaByUserId[u]?.lastText;
                return (
                  <Pressable
                    key={u}
                    onPress={() => setSelectedUserId(u)}
                    style={({ pressed }) => [
                      styles.userItem,
                      isSelected ? styles.userItemSelected : null,
                      pressed ? styles.userItemPressed : null,
                    ]}
                  >
                    <View style={styles.userAvatarWrap}>
                      <View
                        style={[
                          styles.userAvatar,
                          {
                            backgroundColor: hashToColor(u),
                          },
                        ]}
                      />
                      {unread > 0 ? (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadBadgeText}>
                            {unread > 99 ? '99+' : String(unread)}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text numberOfLines={1} style={styles.userName}>
                      {userLabel(u)}
                    </Text>
                    <Text numberOfLines={1} style={styles.userPreview}>
                      {preview ? preview : 'Tap to chat'}
                    </Text>
                    <View style={styles.userOnlineDot} />
                  </Pressable>
                );
              })}
          </ScrollView>
        </View>

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
        />

        <View
          style={[
            styles.composer,
            {
              paddingBottom: Math.max(safeAreaInsets.bottom, 12),
            },
          ]}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={
              selectedUserId
                ? 'Message...'
                : 'Select an online user to start chatting'
            }
            placeholderTextColor="#8A8A8A"
            style={[
              styles.input,
              !selectedUserId ? styles.inputDisabled : null,
            ]}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            editable={!!selectedUserId}
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              !selectedUserId ? styles.sendButtonDisabled : null,
              pressed ? styles.sendButtonPressed : null,
            ]}
            onPress={selectedUserId ? sendMessage : undefined}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <CallOverlay
        visible={callMode !== 'idle'}
        mode={callMode}
        peerLabel={callPeerLabel}
        incomingCall={incomingCall}
        localStream={localStream}
        remoteStream={remoteStream}
        onAccept={acceptIncoming}
        onReject={rejectIncoming}
        onEnd={() => endCall('user_hangup')}
      />
    </View>
  );
}

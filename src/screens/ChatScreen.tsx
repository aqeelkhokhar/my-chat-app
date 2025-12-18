import React, { useEffect, useRef } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useChat } from '../hooks/useChat';
import { useNotifications } from '../hooks/useNotifications';
import { styles } from '../styles/chatStyles';
import type { ChatMessage } from '../types/chat';

export function ChatScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatMessage> | null>(null);

  const { showNotification } = useNotifications();
  const { input, setInput, messages, sendMessage, headerText } =
    useChat(showNotification);

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages.length]);

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
        <Text style={styles.headerTitle}>Chat</Text>
        <Text style={styles.headerSubtitle}>{headerText}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={safeAreaInsets.top}
      >
        <FlatList
          ref={listRef}
          contentContainerStyle={styles.listContent}
          data={messages}
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
            placeholder="Type a message"
            placeholderTextColor="#8A8A8A"
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              pressed ? styles.sendButtonPressed : null,
            ]}
            onPress={sendMessage}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

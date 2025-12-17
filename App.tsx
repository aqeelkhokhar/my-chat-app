/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const socket = io('https://rn-chat-server-gvf8.onrender.com', {
  transports: ['websocket'],
});

type ChatMessage = {
  id: string;
  text: string;
  from: 'me' | 'other';
  senderId?: string;
  clientMessageId?: string;
  createdAt: number;
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(socket.connected);
  const listRef = useRef<FlatList<ChatMessage> | null>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());

  const headerText = useMemo(() => {
    if (!connected) {
      return 'Disconnected';
    }

    return socket.id ? `Connected: ${socket.id}` : 'Connected';
  }, [connected]);

  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
      console.log('Connected:', socket.id);
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onReceiveMessage = (data: unknown) => {
      let text = '';
      let senderId: string | undefined;
      let clientMessageId: string | undefined;

      if (typeof data === 'string') {
        text = data;
      } else if (data && typeof data === 'object') {
        const d = data as Record<string, unknown>;
        if (typeof d.text === 'string') {
          text = d.text;
        } else if (typeof d.message === 'string') {
          text = d.message;
        } else {
          text = JSON.stringify(data);
        }

        if (typeof d.senderId === 'string') {
          senderId = d.senderId;
        }

        if (typeof d.clientMessageId === 'string') {
          clientMessageId = d.clientMessageId;
        } else if (typeof d.messageId === 'string') {
          clientMessageId = d.messageId;
        } else if (typeof d.id === 'string') {
          clientMessageId = d.id;
        }
      }

      if (!text.trim()) {
        return;
      }

      const isFromMe = !!senderId && senderId === socket.id;
      if (isFromMe) {
        return;
      }

      if (clientMessageId) {
        if (seenMessageIdsRef.current.has(clientMessageId)) {
          return;
        }
        seenMessageIdsRef.current.add(clientMessageId);
      }

      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          text,
          from: 'other',
          senderId,
          clientMessageId,
          createdAt: Date.now(),
        },
      ]);
      console.log('New message:', data);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceiveMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
    };
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages.length]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) {
      return;
    }

    const clientMessageId = `${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`;
    socket.emit('send_message', {
      text,
      senderId: socket.id,
      clientMessageId,
      createdAt: Date.now(),
    });
    seenMessageIdsRef.current.add(clientMessageId);
    setMessages(prev => [
      ...prev,
      {
        id: clientMessageId,
        text,
        from: 'me',
        senderId: socket.id,
        clientMessageId,
        createdAt: Date.now(),
      },
    ]);
    setInput('');
  };

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
        {/* <Text style={styles.headerSubtitle}>{headerText}</Text> */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2B2B2B',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    marginTop: 4,
    color: '#B3B3B3',
    fontSize: 12,
  },
  body: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  messageRow: {
    flexDirection: 'row',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  bubbleMe: {
    backgroundColor: '#2F6BFF',
  },
  bubbleOther: {
    backgroundColor: '#222222',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    paddingHorizontal: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2B2B2B',
    backgroundColor: '#0B0B0B',
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#2B2B2B',
    borderRadius: 12,
    paddingHorizontal: 12,
    color: '#FFFFFF',
  },
  sendButton: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    backgroundColor: '#2F6BFF',
  },
  sendButtonPressed: {
    opacity: 0.85,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default App;

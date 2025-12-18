import { useEffect, useMemo, useRef, useState } from 'react';
import { socket } from '../services/socket';
import type { ChatMessage } from '../types/chat';

type ShowNotification = (title: string, body: string) => Promise<void>;

type ConversationMeta = {
  lastText: string;
  lastAt: number;
};

export function useChat(
  showNotification: ShowNotification,
  userId: string | null,
  toUserId: string,
) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(socket.connected);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [unreadByUserId, setUnreadByUserId] = useState<Record<string, number>>(
    {},
  );
  const [metaByUserId, setMetaByUserId] = useState<
    Record<string, ConversationMeta>
  >({});
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const activeChatRef = useRef('');

  const headerText = useMemo(() => {
    if (!connected) {
      return 'Disconnected';
    }

    return socket.id ? `Connected: ${socket.id}` : 'Connected';
  }, [connected]);

  useEffect(() => {
    activeChatRef.current = toUserId.trim();
  }, [toUserId]);

  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
      console.log('Connected:', socket.id);

      if (userId) {
        socket.emit('register', { userId });
        socket.emit('get_online_users');
      }
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onOnlineUsers = (userIds: unknown) => {
      if (!Array.isArray(userIds)) {
        return;
      }
      const normalized = userIds.filter(u => typeof u === 'string') as string[];
      setOnlineUsers(normalized);
    };

    const onReceiveMessage = (data: unknown) => {
      let text = '';
      let fromUserId: string | undefined;
      let receivedToUserId: string | undefined;
      let clientMessageId: string | undefined;
      let createdAt: number | undefined;

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

        if (typeof d.fromUserId === 'string') {
          fromUserId = d.fromUserId;
        } else if (typeof d.senderId === 'string') {
          fromUserId = d.senderId;
        }

        if (typeof d.toUserId === 'string') {
          receivedToUserId = d.toUserId;
        }

        if (typeof d.createdAt === 'number') {
          createdAt = d.createdAt;
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
        console.log('Ignoring empty message');
        return;
      }

      if (clientMessageId && seenMessageIdsRef.current.has(clientMessageId)) {
        console.log(
          'Ignoring duplicate message (already seen):',
          clientMessageId,
        );
        return;
      }

      if (userId && fromUserId === userId) {
        return;
      }

      if (clientMessageId) {
        seenMessageIdsRef.current.add(clientMessageId);
      }

      const normalizedFrom = typeof fromUserId === 'string' ? fromUserId : '';
      const normalizedTo =
        typeof receivedToUserId === 'string' ? receivedToUserId : '';
      const messageCreatedAt =
        typeof createdAt === 'number' ? createdAt : Date.now();

      if (normalizedFrom) {
        setMetaByUserId(prev => ({
          ...prev,
          [normalizedFrom]: {
            lastText: text,
            lastAt: messageCreatedAt,
          },
        }));

        const activeChat = activeChatRef.current;
        if (activeChat !== normalizedFrom) {
          setUnreadByUserId(prev => ({
            ...prev,
            [normalizedFrom]: (prev[normalizedFrom] ?? 0) + 1,
          }));
        }
      }

      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          text,
          from: 'other',
          fromUserId: normalizedFrom || fromUserId,
          toUserId: normalizedTo || receivedToUserId,
          clientMessageId,
          createdAt: messageCreatedAt,
        },
      ]);

      console.log('New message received from other user:', {
        text,
        fromUserId,
        toUserId: receivedToUserId,
        myUserId: userId,
      });

      showNotification('New Message', text);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('online_users', onOnlineUsers);
    socket.on('receive_message', onReceiveMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('online_users', onOnlineUsers);
      socket.off('receive_message', onReceiveMessage);
    };
  }, [showNotification, userId]);

  useEffect(() => {
    const activeChat = toUserId.trim();
    if (!activeChat) {
      return;
    }

    setUnreadByUserId(prev => {
      if (!prev[activeChat]) {
        return prev;
      }
      const next = { ...prev };
      delete next[activeChat];
      return next;
    });
  }, [toUserId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    if (!socket.connected) {
      return;
    }

    socket.emit('register', { userId });
    socket.emit('get_online_users');
  }, [userId]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) {
      return;
    }

    const trimmedToUserId = toUserId.trim();
    if (!trimmedToUserId) {
      return;
    }

    if (!userId) {
      return;
    }

    const clientMessageId = `${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`;

    seenMessageIdsRef.current.add(clientMessageId);

    socket.emit('send_message', {
      text,
      fromUserId: userId,
      toUserId: trimmedToUserId,
      clientMessageId,
      createdAt: Date.now(),
    });

    setMetaByUserId(prev => ({
      ...prev,
      [trimmedToUserId]: {
        lastText: text,
        lastAt: Date.now(),
      },
    }));

    setMessages(prev => [
      ...prev,
      {
        id: clientMessageId,
        text,
        from: 'me',
        fromUserId: userId,
        toUserId: trimmedToUserId,
        clientMessageId,
        createdAt: Date.now(),
      },
    ]);

    setInput('');

    console.log('Message sent:', {
      text,
      clientMessageId,
      fromUserId: userId,
      toUserId: trimmedToUserId,
    });
  };

  return {
    input,
    setInput,
    messages,
    sendMessage,
    connected,
    headerText,
    onlineUsers,
    unreadByUserId,
    metaByUserId,
  };
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { socket } from '../services/socket';
import type { ChatMessage } from '../types/chat';

type ShowNotification = (title: string, body: string) => Promise<void>;

export function useChat(showNotification: ShowNotification) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(socket.connected);
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

      const isFromMe = senderId === socket.id;
      if (isFromMe) {
        console.log('Ignoring message from self:', {
          senderId,
          myId: socket.id,
        });
        return;
      }

      if (clientMessageId) {
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

      console.log('New message received from other user:', {
        text,
        senderId,
        myId: socket.id,
      });

      showNotification('New Message', text);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceiveMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
    };
  }, [showNotification]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) {
      return;
    }

    const clientMessageId = `${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`;

    seenMessageIdsRef.current.add(clientMessageId);

    socket.emit('send_message', {
      text,
      senderId: socket.id,
      clientMessageId,
      createdAt: Date.now(),
    });

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

    console.log('Message sent:', {
      text,
      clientMessageId,
      senderId: socket.id,
    });
  };

  return {
    input,
    setInput,
    messages,
    sendMessage,
    connected,
    headerText,
  };
}

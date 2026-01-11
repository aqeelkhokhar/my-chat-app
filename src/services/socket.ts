import { io } from 'socket.io-client';

export const socket = io('https://rn-chat-server-gvf8.onrender.com', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 500,
  reconnectionDelayMax: 2000,
  timeout: 10000,
});

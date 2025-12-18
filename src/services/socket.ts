import { io } from 'socket.io-client';

export const socket = io('https://rn-chat-server-gvf8.onrender.com', {
  transports: ['websocket'],
});

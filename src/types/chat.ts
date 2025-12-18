export type ChatMessage = {
  id: string;
  text: string;
  from: 'me' | 'other';
  senderId?: string;
  clientMessageId?: string;
  createdAt: number;
};

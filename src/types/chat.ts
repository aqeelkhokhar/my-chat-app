export type ChatMessage = {
  id: string;
  text: string;
  from: 'me' | 'other';
  fromUserId?: string;
  toUserId?: string;
  clientMessageId?: string;
  createdAt: number;
};

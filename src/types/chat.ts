export type ChatMessage = {
  id: string;
  text: string;
  from: 'me' | 'other';
  fromUserId?: string;
  toUserId?: string;
  toUserIds?: string[];
  clientMessageId?: string;
  createdAt: number;
  isGroupMessage?: boolean;
};

export type Group = {
  id: string;
  name: string;
  members: string[];
  createdBy: string;
  createdAt: number;
};

export type CallType = 'audio' | 'video';

export type CallParticipant = {
  userId: string;
  isConnected: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
};

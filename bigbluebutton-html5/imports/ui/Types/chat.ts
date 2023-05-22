import { User } from './user';
export interface Chat {
  chatId: string;
  meetingId: string;
  participantId: string;
  public: boolean;
  totalMessages: number;
  totalUnread: number;
  userId: string;
  participant?: User;
}
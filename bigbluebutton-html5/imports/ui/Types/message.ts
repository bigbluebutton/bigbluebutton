import { User } from './user';

export interface Message {
  chatEmphasizedText: boolean;
  chatId: string;
  correlationId: string;
  createdTime: number;
  createdTimeAsDate: string;
  meetingId: string;
  message: string;
  messageId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  user: User;
}
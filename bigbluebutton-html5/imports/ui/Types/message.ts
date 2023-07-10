import { User } from './user';

export interface Message {
  chatEmphasizedText: boolean;
  chatId: string;
  correlationId: string;
  createdTime: number;
  createdTimeAsDate: string;
  meetingId: string;
  message: string;
  messageType: string;
  messageId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  messageMetadata: string;
  user: User;
}

import { User } from './user';

export interface Message {
  chatEmphasizedText: boolean;
  chatId: string;
  correlationId: string;
  createdAt: string;
  meetingId: string;
  message: string;
  messageType: string;
  messageId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  messageMetadata: string;
  recipientHasSeen: string;
  user: User;
  messageSequence: number;
  replyToMessage: {
    messageSequence: number;
    message: string;
    user: {
      name: string;
      color: string;
    };
  } | null;
}

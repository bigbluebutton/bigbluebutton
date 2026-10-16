import { User } from './user';

export interface Message {
  chatEmphasizedText: boolean;
  chatId: string;
  correlationId: string;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
  deletedBy: {
    name: string;
  } | null;
  meetingId: string;
  message: string | null;
  messageAsHtml: string | null;
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
    editedAt: string | null;
    deletedAt: string | null;
    deletedBy: {
      name: string;
    } | null;
    messageSequence: number;
    message: string | null;
    messageAsHtml: string | null;
    chatEmphasizedText: boolean;
    user: {
      name: string;
      color: string;
    };
  } | null;
  reactions: {
    createdAt: string;
    reactionEmoji: string;
    user: {
      name: string;
      userId: string;
    }
  }[];
}

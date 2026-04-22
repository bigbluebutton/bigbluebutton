import { gql } from '@apollo/client';

export interface Notification {
  notificationType: string;
  icon: string;
  messageId: string;
  messageValues: Record<string, string>;
  isSingleUserNotification: boolean;
  createdAt: string; // You might want to use a Date type if you're parsing this string into a Date object
  notificationId: number;
  messageDescription: string;
}

export interface NotificationResponse {
  notification_stream: Notification[];
}

// This subscription is handled by bbb-graphql-middleware and its content should not be modified
export const getNotificationsStream = gql`
  subscription getNotificationStream($initialCursor: timestamptz!) {
    notification_stream(
      batch_size: 10,
      cursor: {initial_value: {createdAt: $initialCursor}}
    ) {
      notificationType
      icon
      messageId
      messageValues
      isSingleUserNotification
      createdAt
    }
  }
`;

export default {
  getNotificationsStream,
};

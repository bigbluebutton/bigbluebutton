import { useSubscription } from '@apollo/client';
import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { Notification, NotificationResponse, getNotificationsStream } from './queries';
import useCurrentUser from '../../core/hooks/useCurrentUser';
import { notify } from '../../services/notification';
import {
  NotifyPublishedPoll,
  layoutUpdate,
  pendingGuestAlert,
  userJoinPushAlert,
  userLeavePushAlert,
} from './service';

const Notifications: React.FC = () => {
  const [registeredAt, setRegisteredAt] = React.useState<string>(new Date().toISOString());
  const [greaterThanLastOne, setGreaterThanLastOne] = React.useState<number>(0);

  const messageIndexRef = React.useRef<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]:(...arg: any[]) => void
      }>({
        'app.whiteboard.annotations.poll': NotifyPublishedPoll,
        'app.userList.guest.pendingGuestAlert': pendingGuestAlert,
        'app.notification.userJoinPushAlert': userJoinPushAlert,
        'app.notification.userLeavePushAlert': userLeavePushAlert,
        'app.layoutUpdate.label': layoutUpdate,
      });

  const {
    data: currentUser,
  } = useCurrentUser((u) => ({
    registeredAt: u.registeredAt,
    presenter: u.presenter,
    isModerator: u.isModerator,
  }));

  const {
    data: notificationsStream,
  } = useSubscription<NotificationResponse>(getNotificationsStream, {
    variables: { initialCursor: '2024-04-18' },
  });

  const notifier = (notification: Notification) => {
    notify(
      <FormattedMessage
        id={notification.messageId}
        // @ts-ignore - JS code
        values={notification.messageValues}
        description={notification.messageDescription}
      />,
      notification.notificationType,
      notification.icon,
    );
  };

  useEffect(() => {
    if (currentUser && currentUser.registeredAt) {
      if (registeredAt !== currentUser.registeredAt) {
        setRegisteredAt(currentUser.registeredAt);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (notificationsStream && notificationsStream.notification_stream.length > 0) {
      notificationsStream.notification_stream.forEach((notification: Notification) => {
        const createdAt = new Date(notification.createdAt).getTime();
        if (createdAt > greaterThanLastOne) {
          setGreaterThanLastOne(createdAt);
          // Do something with the notification
          if (messageIndexRef.current[notification.messageId]) {
            messageIndexRef.current[notification.messageId](
              notification,
              notifier,
              currentUser?.isModerator,
              currentUser?.presenter,
            );
          } else {
            notifier(notification);
          }
        }
      });
    }
  }, [notificationsStream]);
  return null;
};

export default Notifications;

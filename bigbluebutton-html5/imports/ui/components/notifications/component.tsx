import React, { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
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
import Styled from './styles';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';

const Notifications: React.FC = () => {
  const [registeredAt, setRegisteredAt] = React.useState<string>(new Date().toISOString());
  const [greaterThanLastOne, setGreaterThanLastOne] = React.useState<number>(0);
  const intl = useIntl();

  // Resolve any messageValue that is itself an i18n key (starts with 'app.')
  // so the client-side translation is applied rather than a raw key string.
  const resolveMessageValues = (
    messageValues: Record<string, string>,
  ): Record<string, string> => Object.fromEntries(
    Object.entries(messageValues).map(([k, v]) => [
      k,
      typeof v === 'string' && v.startsWith('app.')
        ? intl.formatMessage({ id: v, defaultMessage: v })
        : v,
    ]),
  );

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
  } = useDeduplicatedSubscription<NotificationResponse>(getNotificationsStream, {
    variables: { initialCursor: '2000-01-01' },
  });

  const notifier = (notification: Notification) => {
    const resolvedValues = resolveMessageValues(notification.messageValues);
    // special guest alert notification, with user name as title
    if (notification.messageId === 'app.userList.guest.pendingGuestAlert') {
      notify(
        <Styled.TitleMessage>{notification.messageValues['0']}</Styled.TitleMessage>,
        notification.notificationType,
        notification.icon,
        null,
        <Styled.ContentMessage>
          <FormattedMessage
            id={notification.messageId}
            // @ts-ignore - JS code
            values={resolvedValues}
            description={notification.messageDescription}
          />
        </Styled.ContentMessage>,
        true,
      );
    } else if (notification.messageId === 'app.notification.presenterRequestApproved') {
      notify(
        <>
          <FormattedMessage
            id="app.notification.presenterRequestApproved.title"
            // @ts-ignore - JS code
            values={{ presenterName: <strong>{notification.messageValues.presenterName}</strong> }}
            description="Title for presenter request approved notification"
          />
          <Styled.ContentMessage>
            <FormattedMessage
              id={notification.messageId}
              // @ts-ignore - JS code
              values={resolvedValues}
              description={notification.messageDescription}
            />
          </Styled.ContentMessage>
        </>,
        notification.notificationType,
        notification.icon,
      );
    } else {
      notify(
        <FormattedMessage
          id={notification.messageId}
          // @ts-ignore - JS code
          values={resolvedValues}
          description={notification.messageDescription}
        />,
        notification.notificationType,
        notification.icon,
      );
    }
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

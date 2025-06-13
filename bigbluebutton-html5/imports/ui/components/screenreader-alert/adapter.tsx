import { useEffect } from 'react';
import { isEqual } from 'radash';
import { defineMessages, useIntl } from 'react-intl';
import { UNREAD_CHATS_SUBSCRIPTION, UnreadChatsSubscriptionResponse } from './queries';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';
import { addAlert } from './service';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';
import logger from '/imports/startup/client/logger';

const intlMessages = defineMessages({
  newMsgAria: {
    id: 'app.navBar.toggleUserList.newMsgAria',
    description: 'label for new message screen reader alert',
  },
  publicChatName: {
    id: 'app.chat.titlePublic',
    description: 'label for public chat name',
  },
});

const ScreenReaderAlertAdapter = () => {
  const { data, error, loading } = useDeduplicatedSubscription<UnreadChatsSubscriptionResponse>(
    UNREAD_CHATS_SUBSCRIPTION,
  );
  const previousData = usePreviousValue(data);
  const intl = useIntl();

  useEffect(() => {
    if (!loading && !error && data && !isEqual(data, previousData)) {
      const { chat: chats } = data;
      const { chat: previousChats } = previousData ?? {};

      chats.forEach((chat) => {
        const previousChat = previousChats && previousChats.find((c) => c.chatId === chat.chatId);

        if (!previousChat || chat.totalUnread > previousChat.totalUnread) {
          const name = chat.participant?.name ?? intl.formatMessage(intlMessages.publicChatName);
          addAlert(`${intl.formatMessage(intlMessages.newMsgAria, { chatName: name })}`);
        }
      });
    }
  }, [data, previousData, error, loading]);

  if (error) {
    logger.error(
      {
        logCode: 'subscription_Failed',
        extraInfo: {
          error,
        },
      },
      'Subscription failed to load',
    );
  }

  return null;
};

export default ScreenReaderAlertAdapter;

import { useEffect } from 'react';
import { isEqual } from 'radash';
import { defineMessages, useIntl } from 'react-intl';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';
import { addAlert } from './service';
import useChat from '/imports/ui/core/hooks/useChat';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import { Chat } from '/imports/ui/Types/chat';

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
  const { data, loading } = useChat((chat) => ({
    chatId: chat.chatId,
    totalUnread: chat.totalUnread,
    participant: chat.participant,
  })) as GraphqlDataHookSubscriptionResponse<Chat[]>;
  const previousData = usePreviousValue(data);
  const intl = useIntl();

  useEffect(() => {
    if (!loading && data && !isEqual(data, previousData)) {
      const unreadChats = data.filter((c) => c.totalUnread > 0);
      const previousUnreadChats = previousData ? previousData.filter((c) => c.totalUnread > 0) : [];

      unreadChats.forEach((chat) => {
        const previousChat = previousUnreadChats && previousUnreadChats.find((c) => c.chatId === chat.chatId);

        if (!previousChat || chat.totalUnread > previousChat.totalUnread) {
          const name = chat.participant?.name ?? intl.formatMessage(intlMessages.publicChatName);
          addAlert(`${intl.formatMessage(intlMessages.newMsgAria, { chatName: name })}`);
        }
      });
    }
  }, [data, previousData, loading]);

  return null;
};

export default ScreenReaderAlertAdapter;

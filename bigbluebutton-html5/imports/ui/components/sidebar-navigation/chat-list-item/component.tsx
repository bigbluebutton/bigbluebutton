/* eslint-disable jsx-a11y/no-access-key */
import React, { useCallback, useEffect, memo } from 'react';
import { layoutSelect, layoutDispatch } from '/imports/ui/components/layout/context';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { defineMessages, useIntl } from 'react-intl';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import { useShortcut } from '../../../core/hooks/useShortcut';
import { useIsChatEnabled } from '/imports/ui/services/features';
import useHasUnreadChatMessages from '../../chat/hooks/useHasUnreadChatMessages';
import SidebarNavigationButton from '/imports/ui/components/sidebar-navigation/sidebar-navigation-button/component';
import { BaseSidebarButtonProps } from '../types';

const intlMessages = defineMessages({
  messagesTitle: {
    id: 'app.userList.messagesTitle',
    description: 'Title for the messages list',
  },
  unreadPlural: {
    id: 'app.userList.chatListItem.unreadPlural',
    description: 'singular aria label for new message',
  },
  unreadSingular: {
    id: 'app.userList.chatListItem.unreadSingular',
    description: 'plural aria label for new messages',
  },
});

const ChatListItem: React.FC<BaseSidebarButtonProps> = ({ isOpened }) => {
  const CHAT_CONFIG = window.meetingClientSettings.public.chat;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
  const intl = useIntl();

  const {
    hasUnreadMessages,
    hasUnreadPrivateMessages,
    activeChat,
  } = useHasUnreadChatMessages({ isChatPanelOpened: isOpened });

  const idChatOpen = layoutSelect((i: Layout) => i.idChatOpen);
  const isChatEnabled = useIsChatEnabled();
  const layoutContextDispatch = layoutDispatch();

  const TOGGLE_CHAT_PUB_AK: string = useShortcut('togglePublicChat');

  useEffect(() => {
    if (!activeChat) return;
    if (activeChat.chatId !== PUBLIC_GROUP_CHAT_ID && activeChat.chatId === idChatOpen) {
      layoutContextDispatch({
        type: ACTIONS.SET_ID_CHAT_OPEN,
        value: activeChat.chatId,
      });
    }
  }, [idChatOpen, activeChat, layoutContextDispatch, PUBLIC_GROUP_CHAT_ID]);

  const handleChatToggle = useCallback((willOpen: boolean) => {
    layoutContextDispatch({
      type: ACTIONS.SET_ID_CHAT_OPEN,
      value: willOpen ? PUBLIC_GROUP_CHAT_ID : undefined,
    });
  }, [layoutContextDispatch, PUBLIC_GROUP_CHAT_ID]);

  if (!isChatEnabled) return null;

  const label = intl.formatMessage(intlMessages.messagesTitle);

  return (
    <SidebarNavigationButton
      panel={PANELS.CHAT}
      isOpened={isOpened}
      iconName="group_chat"
      label={label}
      accessKey={TOGGLE_CHAT_PUB_AK}
      id="chat-toggle-button"
      dataTest="messagesSidebarButton"
      hasNotification={hasUnreadMessages}
      hasPrivateNotification={hasUnreadPrivateMessages}
      onToggle={handleChatToggle}
    />
  );
};

export default memo(ChatListItem);

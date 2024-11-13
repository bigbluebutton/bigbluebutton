/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable jsx-a11y/no-access-key */
import React, { useEffect } from 'react';
import { layoutSelect, layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/component';
import { Input, Layout } from '/imports/ui/components/layout/layoutTypes';
import { useShortcut } from '../../../core/hooks/useShortcut';
import { Chat } from '/imports/ui/Types/chat';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';

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

interface ChatListItemProps {
  chat: Chat,
  chatsAggregateUnreadMessages: number,
}

const ChatListItem = (props: ChatListItemProps) => {
  const CURRENT_PANEL = PANELS.CHAT;
  const CHAT_CONFIG = window.meetingClientSettings.public.chat;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
  const {
    chat,
    chatsAggregateUnreadMessages,
  } = props;

  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const idChatOpen = layoutSelect((i: Layout) => i.idChatOpen);
  const layoutContextDispatch = layoutDispatch();

  const { sidebarContentPanel } = sidebarContent;
  const sidebarContentIsOpen = sidebarContent.isOpen;

  const TOGGLE_CHAT_PUB_AK: string = useShortcut('togglePublicChat');
  const intl = useIntl();

  useEffect(() => {
    if (chat.chatId !== PUBLIC_GROUP_CHAT_ID && chat.chatId === idChatOpen) {
      layoutContextDispatch({
        type: ACTIONS.SET_ID_CHAT_OPEN,
        value: chat.chatId,
      });
    }
  }, [idChatOpen, sidebarContentIsOpen, sidebarContentPanel, chat]);

  const handleClickToggleChat = () => {
    // Verify if chat panel is open
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: sidebarContentPanel !== CURRENT_PANEL,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: sidebarContentPanel === CURRENT_PANEL
        ? PANELS.NONE
        : CURRENT_PANEL,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_ID_CHAT_OPEN,
      value: PUBLIC_GROUP_CHAT_ID,
    });
  };

  return (
    <TooltipContainer
      title={intl.formatMessage(intlMessages.messagesTitle)}
      position="right"
    >
      <Styled.ListItem
        data-test="chatButton"
        role="button"
        aria-expanded={sidebarContentPanel === CURRENT_PANEL}
        active={sidebarContentPanel === CURRENT_PANEL}
        tabIndex={0}
        accessKey={TOGGLE_CHAT_PUB_AK}
        onClick={handleClickToggleChat}
        id="chat-toggle-button"
        aria-label={intl.formatMessage(intlMessages.messagesTitle)}
        hasNotification={chatsAggregateUnreadMessages > 0}
        // @ts-ignore
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <Icon iconName="group_chat" />
      </Styled.ListItem>
    </TooltipContainer>
  );
};

export default ChatListItem;

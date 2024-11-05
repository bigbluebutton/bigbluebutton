/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable jsx-a11y/no-access-key */
import React, { useEffect } from 'react';
import { layoutSelect, layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/component';
import { useShortcut } from '../../../../../../core/hooks/useShortcut';
import { Chat } from '/imports/ui/Types/chat';

const intlMessages = defineMessages({
  titlePublic: {
    id: 'app.chat.titlePublic',
    description: 'title for public chat',
  },
  unreadPlural: {
    id: 'app.userList.chatListItem.unreadPlural',
    description: 'plural aria label for new messages',
  },
  unreadSingular: {
    id: 'app.userList.chatListItem.unreadSingular',
    description: 'singular aria label for new message',
  },
});

interface ChatListItemProps {
  chat: Chat;
  chatNodeRef: React.Ref<HTMLButtonElement>;
  index: number;
}

const ChatListItem = ({ chat, chatNodeRef }: ChatListItemProps) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const idChatOpen = layoutSelect((i) => i.idChatOpen);
  const layoutContextDispatch = layoutDispatch();

  const sidebarContentIsOpen = sidebarContent.isOpen;
  const TOGGLE_CHAT_PUB_AK: string = useShortcut('togglePublicChat');
  const intl = useIntl();
  const countUnreadMessages = chat.totalUnread || 0;

  const chatPanelOpen = sidebarContentIsOpen && sidebarContent.sidebarContentPanel === PANELS.CHAT;
  const isCurrentChat = chat.chatId === idChatOpen && chatPanelOpen;

  useEffect(() => {
    if (chat.chatId === idChatOpen) {
      layoutContextDispatch({
        type: ACTIONS.SET_ID_CHAT_OPEN,
        value: chat.chatId,
      });
    }
  }, [idChatOpen, sidebarContentIsOpen, chat]);

  const handleClickToggleChat = () => {
    if (sidebarContentIsOpen && sidebarContent.sidebarContentPanel === PANELS.CHAT) {
      if (idChatOpen === chat.chatId) {
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
          value: false,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
          value: PANELS.NONE,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_ID_CHAT_OPEN,
          value: '',
        });
      } else {
        layoutContextDispatch({
          type: ACTIONS.SET_ID_CHAT_OPEN,
          value: chat.chatId,
        });
      }
    } else {
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
        value: true,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
        value: PANELS.CHAT,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_ID_CHAT_OPEN,
        value: chat.chatId,
      });
    }
  };

  const arialabel = `${intl.formatMessage(intlMessages.titlePublic)} ${
    countUnreadMessages > 1
      ? intl.formatMessage(intlMessages.unreadPlural, { 0: countUnreadMessages })
      : intl.formatMessage(intlMessages.unreadSingular)
  }`;

  return (
    <Styled.ChatListItem
      data-test="chatButton"
      role="button"
      aria-expanded={isCurrentChat}
      active={isCurrentChat}
      tabIndex={-1}
      accessKey={TOGGLE_CHAT_PUB_AK}
      onClick={handleClickToggleChat}
      id="chat-toggle-button"
      aria-label={intl.formatMessage(intlMessages.titlePublic)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      ref={chatNodeRef}
    >
      <Styled.ChatListItemLink>
        <Styled.ChatIcon>
          <Styled.ChatThumbnail>
            <Icon iconName="group_chat" />
          </Styled.ChatThumbnail>
        </Styled.ChatIcon>
        <Styled.ChatName>
          <Styled.ChatNameMain active={isCurrentChat}>
            {intl.formatMessage(intlMessages.titlePublic)}
          </Styled.ChatNameMain>
        </Styled.ChatName>
        {countUnreadMessages > 0 && (
          <Styled.UnreadMessages data-test="unreadMessages" aria-label={arialabel}>
            <Styled.UnreadMessagesText aria-hidden="true">
              {countUnreadMessages}
            </Styled.UnreadMessagesText>
          </Styled.UnreadMessages>
        )}
      </Styled.ChatListItemLink>
    </Styled.ChatListItem>
  );
};

export default ChatListItem;

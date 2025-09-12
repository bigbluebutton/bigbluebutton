/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable jsx-a11y/no-access-key */
import React, { useEffect } from 'react';
import { layoutSelect, layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/component';
import { Input, Layout } from '/imports/ui/components/layout/layoutTypes';
import { useShortcut } from '../../../../../../core/hooks/useShortcut';
import { Chat } from '/imports/ui/Types/chat';

const intlMessages = defineMessages({
  titlePublic: {
    id: 'app.chat.titlePublic',
    description: 'title for public chat',
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
  chat: Chat;
  chatNodeRef: React.Ref<HTMLButtonElement>;
  index: number;
}

const ChatListItem = (props: ChatListItemProps) => {
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const idChatOpen = layoutSelect((i: Layout) => i.idChatOpen);
  const layoutContextDispatch = layoutDispatch();

  const { sidebarContentPanel } = sidebarContent;
  const sidebarContentIsOpen = sidebarContent.isOpen;

  const TOGGLE_CHAT_PUB_AK: string = useShortcut('togglePublicChat');
  const {
    chat,
    chatNodeRef,
    index,
  } = props;

  const countUnreadMessages = chat.totalUnread || 0;

  const intl = useIntl();

  const chatPanelOpen = sidebarContentIsOpen && sidebarContentPanel === PANELS.CHAT;

  const isCurrentChat = chat.chatId === idChatOpen && chatPanelOpen;

  const ROLE_MODERATOR = window.meetingClientSettings.public.user.role_moderator;

  const CHAT_CONFIG = window.meetingClientSettings.public.chat;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;

  const isPublicGroupChat = (chat: Chat) => chat.chatId === PUBLIC_GROUP_CHAT_ID;

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

    if (sidebarContentIsOpen && sidebarContentPanel === PANELS.CHAT) {
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
        setTimeout(() => {
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
        }, 0);
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

  const localizedChatName = isPublicGroupChat(chat)
    ? intl.formatMessage(intlMessages.titlePublic)
    : chat.participant?.name;

  const arialabel = `${localizedChatName} ${countUnreadMessages > 1
    ? intl.formatMessage(intlMessages.unreadPlural, { unreadCount: countUnreadMessages })
    : intl.formatMessage(intlMessages.unreadSingular)}`;

  return (
    <Styled.ChatListItem
      data-test="chatButton"
      role="button"
      aria-expanded={isCurrentChat}
      active={isCurrentChat}
      tabIndex={-1}
      accessKey={isPublicGroupChat(chat) ? TOGGLE_CHAT_PUB_AK : undefined}
      onClick={handleClickToggleChat}
      id={`chat-list-${index}`}
      aria-label={isPublicGroupChat(chat) ? intl.formatMessage(intlMessages.titlePublic)
        : chat.participant?.name}
      ref={chatNodeRef}
    >
      <Styled.ChatListItemLink>
        <Styled.ChatIcon>
          {isPublicGroupChat(chat)
            ? (
              <Styled.ChatThumbnail>
                <Icon iconName="group_chat" className={undefined} prependIconName={undefined} rotate={undefined} color={undefined} />
              </Styled.ChatThumbnail>
            ) : (
              <Styled.UserAvatar
                moderator={chat.participant?.role === ROLE_MODERATOR}
                avatar={chat.participant?.avatar || ''}
                color={chat.participant?.color || ''}
              >
                {chat.participant?.avatar?.length === 0 ? chat.participant?.name?.toLowerCase().slice(0, 2) : ''}
              </Styled.UserAvatar>
            )}
        </Styled.ChatIcon>
        <Styled.ChatName>
          <Styled.ChatNameMain active={false}>
            {isPublicGroupChat(chat)
              ? intl.formatMessage(intlMessages.titlePublic) : chat.participant?.name}
          </Styled.ChatNameMain>
        </Styled.ChatName>
        {(countUnreadMessages > 0)
          ? (
            <Styled.UnreadMessages data-test="unreadMessages" aria-label={arialabel}>
              <Styled.UnreadMessagesText aria-hidden="true">
                {countUnreadMessages}
              </Styled.UnreadMessagesText>
            </Styled.UnreadMessages>
          )
          : null}
      </Styled.ChatListItemLink>
    </Styled.ChatListItem>
  );
};

export default ChatListItem;

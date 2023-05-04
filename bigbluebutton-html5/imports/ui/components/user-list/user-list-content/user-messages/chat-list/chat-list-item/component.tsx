import React, { useEffect } from 'react';
import { layoutSelect, layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { defineMessages, useIntl } from 'react-intl';
import { Meteor } from 'meteor/meteor'
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/component';
import { Input, Layout } from '/imports/ui/components/layout/layoutTypes';
import { Chat } from './chatTypes';
import { useShortcutHelp } from '/imports/ui/components/shortcut-help/useShortcutHelp'

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
  chat: Chat,
}

const CHAT_CONFIG = Meteor.settings.public.chat;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;

const isPublicGroupChat = (chat: Chat) => chat.chatId === PUBLIC_GROUP_CHAT_ID;

const ChatListItem = (props: ChatListItemProps) => {
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const idChatOpen = layoutSelect((i: Layout) => i.idChatOpen);
  const layoutContextDispatch = layoutDispatch();

  const { sidebarContentPanel } = sidebarContent;
  const sidebarContentIsOpen = sidebarContent.isOpen;

  const TOGGLE_CHAT_PUB_AK: Object | string | undefined = useShortcutHelp("togglePublicChat");
  const {
    chat,
  } = props;

  const countUnreadMessages = chat.totalUnread;

  const intl = useIntl();

  const chatPanelOpen = sidebarContentIsOpen && sidebarContentPanel === PANELS.CHAT;

  const isCurrentChat = chat.chatId === idChatOpen && chatPanelOpen;

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

  const localizedChatName = isPublicGroupChat(chat)
    ? intl.formatMessage(intlMessages.titlePublic)
    : chat.participant.name;

  const arialabel = `${localizedChatName} ${
    countUnreadMessages > 1
      ? intl.formatMessage(intlMessages.unreadPlural, { 0: countUnreadMessages })
      : intl.formatMessage(intlMessages.unreadSingular)}`;

  return (
    <Styled.ChatListItem
      data-test="chatButton"
      role="button"
      aria-expanded={isCurrentChat}
      active={isCurrentChat}
      tabIndex={0}
      accessKey={isPublicGroupChat(chat) ? TOGGLE_CHAT_PUB_AK : null}
      onClick={handleClickToggleChat}
      id="chat-toggle-button"
      aria-label={isPublicGroupChat(chat) ? intl.formatMessage(intlMessages.titlePublic) : chat.participant.name}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <Styled.ChatListItemLink>
        <Styled.ChatIcon>
          {isPublicGroupChat(chat)
            ? (
              <Styled.ChatThumbnail>
                <Icon iconName={"group_chat"} />
              </Styled.ChatThumbnail>
            ) : (
              <Styled.UserAvatar
                moderator={chat.participant.role === ROLE_MODERATOR}
                avatar={chat.participant.avatar}
                color={chat.participant.color}
              >
                {chat.participant.name.toLowerCase().slice(0, 2)}
              </Styled.UserAvatar>
            )}
        </Styled.ChatIcon>
        <Styled.ChatName>
          <Styled.ChatNameMain>
            {isPublicGroupChat(chat)
              ? intl.formatMessage(intlMessages.titlePublic) : chat.participant.name}
          </Styled.ChatNameMain>
        </Styled.ChatName>
        {(countUnreadMessages > 0)
          ? (
            <Styled.UnreadMessages aria-label={arialabel}>
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

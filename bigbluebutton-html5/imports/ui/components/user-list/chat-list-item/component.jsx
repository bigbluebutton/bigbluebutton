import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import Styled from './styles';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import { ACTIONS, PANELS } from '../../layout/enums';
import Icon from '/imports/ui/components/common/icon/component';

const DEBOUNCE_TIME = 1000;
const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;

let globalAppplyStateToProps = () => {};

const throttledFunc = _.debounce(() => {
  globalAppplyStateToProps();
}, DEBOUNCE_TIME, { trailing: true, leading: true });

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

const propTypes = {
  chat: PropTypes.shape({
    userId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    unreadCounter: PropTypes.number.isRequired,
  }).isRequired,
  idChatOpen: PropTypes.string.isRequired,
  compact: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  tabIndex: PropTypes.number.isRequired,
  isPublicChat: PropTypes.func.isRequired,
  shortcuts: PropTypes.string,
};

const defaultProps = {
  shortcuts: '',
};

const ChatListItem = (props) => {
  const {
    chat,
    activeChatId,
    idChatOpen,
    compact,
    intl,
    tabIndex,
    isPublicChat,
    shortcuts: TOGGLE_CHAT_PUB_AK,
    sidebarContentIsOpen,
    sidebarContentPanel,
    layoutContextDispatch,
  } = props;

  const chatPanelOpen = sidebarContentIsOpen && sidebarContentPanel === PANELS.CHAT;

  const isCurrentChat = chat.chatId === activeChatId && chatPanelOpen;

  const [stateUreadCount, setStateUreadCount] = useState(0);

  if (chat.unreadCounter !== stateUreadCount && (stateUreadCount < chat.unreadCounter)) {
    globalAppplyStateToProps = () => {
      setStateUreadCount(chat.unreadCounter);
    };
    throttledFunc();
  } else if (chat.unreadCounter !== stateUreadCount && (stateUreadCount > chat.unreadCounter)) {
    setStateUreadCount(chat.unreadCounter);
  }

  useEffect(() => {
    if (chat.userId !== PUBLIC_CHAT_KEY && chat.userId === idChatOpen) {
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

  const localizedChatName = isPublicChat(chat)
    ? intl.formatMessage(intlMessages.titlePublic)
    : chat.name;

  const arialabel = `${localizedChatName} ${
    stateUreadCount > 1
      ? intl.formatMessage(intlMessages.unreadPlural, { 0: stateUreadCount })
      : intl.formatMessage(intlMessages.unreadSingular)}`;

  return (
    <Styled.ChatListItem
      data-test="chatButton"
      role="button"
      aria-expanded={isCurrentChat}
      active={isCurrentChat}
      tabIndex={tabIndex}
      accessKey={isPublicChat(chat) ? TOGGLE_CHAT_PUB_AK : null}
      onClick={handleClickToggleChat}
      id="chat-toggle-button"
      aria-label={isPublicChat(chat) ? intl.formatMessage(intlMessages.titlePublic) : chat.name}
      onKeyPress={() => {}}
    >
      <Styled.ChatListItemLink>
        <Styled.ChatIcon>
          {chat.icon
            ? (
              <Styled.ChatThumbnail>
                <Icon iconName={chat.icon} />
              </Styled.ChatThumbnail>
            ) : (
              <UserAvatar
                moderator={chat.isModerator}
                avatar={chat.avatar}
                color={chat.color}
              >
                {chat.name.toLowerCase().slice(0, 2)}
              </UserAvatar>
            )}
        </Styled.ChatIcon>
        <Styled.ChatName aria-live="off">
          {!compact
            ? (
              <Styled.ChatNameMain>
                {isPublicChat(chat)
                  ? intl.formatMessage(intlMessages.titlePublic) : chat.name}
              </Styled.ChatNameMain>
            ) : null}
        </Styled.ChatName>
        {(stateUreadCount > 0)
          ? (
            <Styled.UnreadMessages aria-label={arialabel}>
              <Styled.UnreadMessagesText aria-hidden="true">
                {stateUreadCount}
              </Styled.UnreadMessagesText>
            </Styled.UnreadMessages>
          )
          : null}
      </Styled.ChatListItemLink>
    </Styled.ChatListItem>
  );
};

ChatListItem.propTypes = propTypes;
ChatListItem.defaultProps = defaultProps;

export default withShortcutHelper(injectIntl(ChatListItem), 'togglePublicChat');

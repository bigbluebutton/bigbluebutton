import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';
import { styles } from './styles';
import ChatAvatar from './chat-avatar/component';
import ChatIcon from './chat-icon/component';
import ChatUnreadCounter from './chat-unread-messages/component';

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

const SHORTCUTS_CONFIG = Meteor.settings.public.app.shortcuts;
const TOGGLE_CHAT_PUB_AK = SHORTCUTS_CONFIG.togglePublicChat.accesskey;

const propTypes = {
  chat: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    unreadCounter: PropTypes.number.isRequired,
  }).isRequired,
  openChat: PropTypes.string,
  compact: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  tabIndex: PropTypes.number.isRequired,
  isPublicChat: PropTypes.func.isRequired,
};

const defaultProps = {
  openChat: '',
};

const ChatListItem = (props) => {
  const {
    chat,
    openChat,
    compact,
    intl,
    tabIndex,
    isPublicChat,
  } = props;

  const isCurrentChat = chat.id === openChat;
  const linkClasses = {};
  linkClasses[styles.active] = isCurrentChat;

  return (
    <div
      role="button"
      className={cx(styles.chatListItem, linkClasses)}
      aria-expanded={isCurrentChat}
      tabIndex={tabIndex}
      accessKey={isPublicChat(chat) ? TOGGLE_CHAT_PUB_AK : null}
      onClick={() => {
        Session.set('isChatOpen', true);
        Session.set('idChatOpen', chat.id);
      }}
      id="chat-toggle-button"
      aria-label={isPublicChat(chat) ? intl.formatMessage(intlMessages.titlePublic) : chat.name}
    >

      <div className={styles.chatListItemLink}>
        <div className={styles.chatIcon}>
          {chat.icon ?
            <ChatIcon icon={chat.icon} />
            :
            <ChatAvatar
              isModerator={chat.isModerator}
              color={chat.color}
              name={chat.name.toLowerCase().slice(0, 2)}
            />}
        </div>
        <div className={styles.chatName}>
          {!compact ?
            <span className={styles.chatNameMain}>
              {isPublicChat(chat) ?
              intl.formatMessage(intlMessages.titlePublic) : chat.name}
            </span> : null}
        </div>
        {(chat.unreadCounter > 0) ?
          <ChatUnreadCounter
            counter={chat.unreadCounter}
          />
          : null}
      </div>
    </div>
  );
};

ChatListItem.propTypes = propTypes;
ChatListItem.defaultProps = defaultProps;

export default injectIntl(ChatListItem);

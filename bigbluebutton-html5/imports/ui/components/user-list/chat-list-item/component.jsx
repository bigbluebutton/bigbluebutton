import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router';
import cx from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';
import styles from './styles.scss';
import ChatAvatar from './chat-avatar/component';
import ChatIcon from './chat-icon/component';
import ChatUnreadMessages from './chat-unread-messages/component';

const intlMessages = defineMessages({
  titlePublic: {
    id: 'app.chat.titlePublic',
    description: 'title for public chat',
  },
});

const CHAT_CONFIG = Meteor.settings.public.chat;
const PRIVATE_CHAT_PATH = CHAT_CONFIG.path_route;

const propTypes = {
  chat: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    unreadCounter: PropTypes.number.isRequired,
  }).isRequired,
  openChat: PropTypes.string,
  compact: PropTypes.bool.isRequired,
  intl: PropTypes.object.isRequired,
  tabIndex: PropTypes.number.isRequired,
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
    } = props;

  const linkPath = [PRIVATE_CHAT_PATH, chat.id].join('');
  const isCurrentChat = chat.id === openChat;
  const isSingleMessage = chat.unreadCounter === 1;

  const linkClasses = {};
  linkClasses[styles.active] = isCurrentChat;

  if (chat.name === 'Public Chat') {
    chat.name = intl.formatMessage(intlMessages.titlePublic);
  }

  return (
    <Link
      to={linkPath}
      className={cx(styles.chatListItem, linkClasses)}
      role="button"
      aria-expanded={isCurrentChat}
      tabIndex={tabIndex}
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
          {!compact ? <span className={styles.chatNameMain}>{chat.name}</span> : null}
        </div>
        {(chat.unreadCounter > 0) ?
          <ChatUnreadMessages
            isSingleMessage={isSingleMessage}
            unreadCounter={chat.unreadCounter}
          />
          : null}
      </div>
    </Link>
  );
};

ChatListItem.propTypes = propTypes;
ChatListItem.defaultProps = defaultProps;

export default withRouter(injectIntl(ChatListItem));

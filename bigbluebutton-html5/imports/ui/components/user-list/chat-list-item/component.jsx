import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';
import { Session } from 'meteor/session';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
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

const propTypes = {
  chat: PropTypes.shape({
    userId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    unreadCounter: PropTypes.number.isRequired,
  }).isRequired,
  activeChatId: PropTypes.string.isRequired,
  compact: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  tabIndex: PropTypes.number.isRequired,
  isPublicChat: PropTypes.func.isRequired,
  chatPanelOpen: PropTypes.bool.isRequired,
  shortcuts: PropTypes.string,
};

const defaultProps = {
  shortcuts: '',
};

const handleClickToggleChat = (id) => {
  Session.set(
    'openPanel',
    Session.get('openPanel') === 'chat' && Session.get('idChatOpen') === id
      ? 'userlist' : 'chat',
  );
  if (Session.equals('openPanel', 'chat')) {
    Session.set('idChatOpen', id);
  } else {
    Session.set('idChatOpen', '');
  }
};

const ChatListItem = (props) => {
  const {
    chat,
    activeChatId,
    compact,
    intl,
    tabIndex,
    isPublicChat,
    shortcuts: TOGGLE_CHAT_PUB_AK,
    chatPanelOpen,
  } = props;

  const isCurrentChat = chat.userId === activeChatId && chatPanelOpen;
  const linkClasses = {};
  linkClasses[styles.active] = isCurrentChat;

  return (
    <div
      data-test="chatButton"
      role="button"
      className={cx(styles.chatListItem, linkClasses)}
      aria-expanded={isCurrentChat}
      tabIndex={tabIndex}
      accessKey={isPublicChat(chat) ? TOGGLE_CHAT_PUB_AK : null}
      onClick={() => handleClickToggleChat(chat.userId)}
      id="chat-toggle-button"
      aria-label={isPublicChat(chat) ? intl.formatMessage(intlMessages.titlePublic) : chat.name}
    >

      <div className={styles.chatListItemLink}>
        <div className={styles.chatIcon}>
          {chat.icon
            ? <ChatIcon icon={chat.icon} />
            : (
              <ChatAvatar
                isModerator={chat.isModerator}
                color={chat.color}
                name={chat.name.toLowerCase().slice(0, 2)}
              />
            )}
        </div>
        <div className={styles.chatName}>
          {!compact
            ? (
              <span className={styles.chatNameMain}>
                {isPublicChat(chat)
                  ? intl.formatMessage(intlMessages.titlePublic) : chat.name}
              </span>
            ) : null}
        </div>
        {(chat.unreadCounter > 0)
          ? (
            <ChatUnreadCounter
              counter={chat.unreadCounter}
            />
          )
          : null}
      </div>
    </div>
  );
};

ChatListItem.propTypes = propTypes;
ChatListItem.defaultProps = defaultProps;

export default withShortcutHelper(injectIntl(ChatListItem), 'togglePublicChat');

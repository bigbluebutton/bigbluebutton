import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import Icon from '/imports/ui/components/icon/component';
import styles from './styles.scss';
import { withRouter } from 'react-router';
import { Link } from 'react-router';
import cx from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';

const intlMessages = defineMessages({
  titlePublic: {
    id: 'app.chat.titlePublic',
    description: 'title for public chat',
  },
  unreadPlural: {
    id: 'app.userlist.chatlistitem.unreadPlural',
    description: 'singular aria label for new message',
  },
  unreadSingular: {
    id: 'app.userlist.chatlistitem.unreadSingular',
    description: 'plural aria label for new messages',
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
};

const defaultProps = {
};

class ChatListItem extends Component {
  render() {
    const {
      chat,
      openChat,
      compact,
      intl,
      tabIndex,
    } = this.props;

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
            {chat.icon ? this.renderChatIcon() : this.renderChatAvatar()}
          </div>
          <div className={styles.chatName}>
            {!compact ? <span className={styles.chatNameMain}>{chat.name}</span> : null }
          </div>
          {(chat.unreadCounter > 0) ?
            <div
              className={styles.unreadMessages}
              aria-label={isSingleMessage
                  ? intl.formatMessage(intlMessages.unreadSingular, { 0: chat.unreadCounter })
                  : intl.formatMessage(intlMessages.unreadPlural, { 0: chat.unreadCounter })}
            >
              <div className={styles.unreadMessagesText} aria-hidden="true">
                {chat.unreadCounter}
              </div>
            </div>
              : null}
        </div>
      </Link>
    );
  }

  renderChatAvatar() {
    const user = this.props.chat;
    return (
      <UserAvatar
        moderator={user.isModerator}
        color={user.color}
      >
        {user.name.toLowerCase().slice(0, 2)}
      </UserAvatar>
    );
  }

  renderChatIcon() {
    return (
      <div className={styles.chatThumbnail}>
        <Icon iconName={this.props.chat.icon} className={styles.actionIcon} />
      </div>
    );
  }
}

ChatListItem.propTypes = propTypes;
ChatListItem.defaultProps = defaultProps;

export default withRouter(injectIntl(ChatListItem));

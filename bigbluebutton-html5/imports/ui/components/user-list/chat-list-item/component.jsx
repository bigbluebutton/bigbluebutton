import React, { Component } from 'react';
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
  },
  unreadPlural: {
    id: 'app.chatlistitem.unreadPlural',
  },
  unreadSingular: {
    id: 'app.chatlistitem.unreadSingular',
  },
});

const CHAT_CONFIG = Meteor.settings.public.chat;
const PRIVATE_CHAT_PATH = CHAT_CONFIG.path_route;

const propTypes = {
  chat: React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    unreadCounter: React.PropTypes.number.isRequired,
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
    } = this.props;

    const linkPath = [PRIVATE_CHAT_PATH, chat.id].join('');
    const isCurrentChat = chat.id === openChat;

    let linkClasses = {};
    linkClasses[styles.active] = isCurrentChat;

    if (chat.name === 'Public Chat') {
      chat.name = intl.formatMessage(intlMessages.titlePublic);
    }

    return (
      <li className={cx(styles.chatListItem, linkClasses)}>
        <Link
          to={linkPath}
          className={styles.chatListItemLink}
          role="button"
          aria-expanded={isCurrentChat}>
            {chat.icon ? this.renderChatIcon() : this.renderChatAvatar()}
            <div className={styles.chatName}>
              {!compact ? <h3 className={styles.chatNameMain}>{chat.name}</h3> : null }
            </div>
            {(chat.unreadCounter > 0) ?
              <div className={styles.unreadMessages}>
                <div className={styles.unreadMessagesText} aria-describedby="newMsgDesc">
                  {chat.unreadCounter}
                  <div
                    id="newMsgDesc"
                    aria-label={chat.unreadCounter === 1
                      ? intl.formatMessage(intlMessages.unreadSingular)
                      : intl.formatMessage(intlMessages.unreadPlural)}
                    />
                </div>
              </div>
              : null}
        </Link>
      </li>
    );
  }

  renderChatAvatar() {
    return <UserAvatar user={this.props.chat}/>;
  }

  renderChatIcon() {
    return (
      <div className={styles.chatThumbnail}>
        <Icon iconName={this.props.chat.icon} className={styles.actionIcon}/>
      </div>
    );
  }
}

ChatListItem.propTypes = propTypes;
ChatListItem.defaultProps = defaultProps;

export default withRouter(injectIntl(ChatListItem));

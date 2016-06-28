import React, { Component } from 'react';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import Icon from '/imports/ui/components/icon/component';
import styles from './styles.scss';
import { Link } from 'react-router';

const PRIVATE_CHAT_PATH = 'users/chat/';

const propTypes = {
  chat: React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
  }).isRequired,
};

const defaultProps = {
};

class ChatListItem extends Component {
  render() {
    const {
      chat,
    } = this.props;

    const linkPath = [PRIVATE_CHAT_PATH, chat.id].join('');
    let fakeUnreadCount = Math.round(Math.random() * 33);

    return (
      <li {...this.props}>
          <Link to={linkPath} className={styles.chatListItem}>
            {chat.icon ? this.renderChatIcon() : this.renderChatAvatar()}
            <div className={styles.chatName}>
              <h3 className={styles.chatNameMain}>{chat.name}</h3>
            </div>
            <div className={styles.unreadMessages}>
              <p className={styles.unreadMessagesText}>{fakeUnreadCount}</p>
            </div>
          </Link>
      </li>
    );
  }

  renderChatAvatar() {
    const {
      chat,
    } = this.props;

    return <UserAvatar user={chat}/>;
  }

  renderChatIcon() {
    const {
      chat,
    } = this.props;

    return (
      <div className={styles.chatThumbnail}>
        <Icon iconName={chat.icon} className={styles.actionIcon}/>
      </div>
    );
  }
}

ChatListItem.propTypes = propTypes;
ChatListItem.defaultProps = defaultProps;

export default ChatListItem;

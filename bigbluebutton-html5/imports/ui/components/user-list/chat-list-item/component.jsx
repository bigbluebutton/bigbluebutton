import React, { Component } from 'react';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import Icon from '/imports/ui/components/icon/component';
import styles from './styles.scss';
import { withRouter } from 'react-router';
import { Link } from 'react-router';
import cx from 'classnames';

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
      openChat,
    } = this.props;

    const linkPath = [PRIVATE_CHAT_PATH, chat.id].join('');
    let fakeUnreadCount = Math.round(Math.random() * 33);

    let linkClasses = {};
    linkClasses[styles.active] = chat.id === openChat;
    return (
      <li {...this.props}>
        <Link to={linkPath} className={cx(styles.chatListItem, linkClasses)}>
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

export default withRouter(ChatListItem);

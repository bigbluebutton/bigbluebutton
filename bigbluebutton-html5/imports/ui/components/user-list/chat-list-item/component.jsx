import React, { Component } from 'react';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import Icon from '/imports/ui/components/icon/component';
import styles from './styles.scss';
import { withRouter } from 'react-router';
import { Link } from 'react-router';
import cx from 'classnames';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PRIVATE_CHAT_PATH = CHAT_CONFIG.private_path;

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
    } = this.props;

    const linkPath = [PRIVATE_CHAT_PATH, chat.id].join('');

    let linkClasses = {};
    linkClasses[styles.active] = chat.id === openChat;

    return (
      <li className={cx(styles.chatListItem, linkClasses)} {...this.props}>
        <Link to={linkPath} className={styles.chatListItemLink}>
          {chat.icon ? this.renderChatIcon() : this.renderChatAvatar()}
          <div className={styles.chatName}>
            <h3 className={styles.chatNameMain}>{chat.name}</h3>
          </div>
          {(chat.unreadCounter > 0) ?
            <div className={styles.unreadMessages}>
              <p className={styles.unreadMessagesText}>{chat.unreadCounter}</p>
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

export default withRouter(ChatListItem);

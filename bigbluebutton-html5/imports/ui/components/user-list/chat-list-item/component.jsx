import React, { Component } from 'react';
import UserAvatar from '../../user-avatar/component';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Icon from '../../icon/component';
import styles from './styles.scss';
import { Link } from 'react-router';
import classNames from 'classnames';
import cx from 'classnames';

const PRIVATE_CHAT_PATH = 'users/chat/';

export default class ChatListItem extends Component {
  render() {
    let chat = this.props.chat;
    let linkPath = [PRIVATE_CHAT_PATH, chat.id].join('');

    return (
      <li tabIndex='0'
          {...this.props}>
          <Link to={linkPath} className={styles.chatListItem}>
            {chat.icon ? this.renderChatIcon() : this.renderChatAvatar()}
            <div className={styles.chatName}>
              <h3 className={styles.chatNameMain}>{chat.name}</h3>
            </div>
            <div className={styles.unreadMessages}>
              <p className={styles.unreadMessagesText}>{Math.round(Math.random() * 33)}</p>
            </div>
          </Link>
      </li>
    );
  }

  renderChatAvatar() {
    let chat = this.props.chat;

    return <UserAvatar user={chat}/>;
  }

  renderChatIcon() {
    let chat = this.props.chat;
    return (
      <div className={styles.chatThumbnail}>
        <Icon iconName={chat.icon} className={styles.actionIcon}/>
      </div>
    );
  }
}

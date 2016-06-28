import React, { Component } from 'react';
import styles from './styles.scss';
import { Link } from 'react-router';
import classNames from 'classnames';

export default class ChatListItem extends Component {
  render() {
    return (
      <li tabIndex='0' className={styles.chatListItem} {...this.props}>
        <div className={styles.chatThumbnail}>
          <i className="icon-bbb-group-chat"></i>
        </div>
        <div className={styles.chatName}>
          <h3 className={styles.chatNameMain}>Public Chat</h3>
        </div>
        <div className={styles.unreadMessages}>
          <p className={styles.unreadMessagesText}>{Math.round(Math.random() * 33)}</p>
        </div>
      </li>
    );
  }
}

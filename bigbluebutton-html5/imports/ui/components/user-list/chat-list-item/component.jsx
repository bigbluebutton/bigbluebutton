import React, { Component } from 'react';
import styles from '../styles.scss';
import { Link } from 'react-router';
import classNames from 'classnames';

export default class ChatListItem extends Component {
  render() {

    return (
      <li className={styles.chatListItem}>
        <div className={styles.chatThumbnail}>
          <i className="icon-bbb-group-chat"></i>
        </div>
        <div className={styles.chatName}>
          <h3>Public Chat</h3>
        </div>
        <div className={styles.unreadMessages}>
          <p>{Math.round(Math.random()*33)}</p>
        </div>
      </li>
    );
  }
}

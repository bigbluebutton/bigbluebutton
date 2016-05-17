import React, { Component } from 'react';
import styles from './styles.scss';
import { Link } from 'react-router';
import UserListItem from './UserListItem';
import ChatListItem from './ChatListItem';

export default class UserList extends Component {
  render() {
    return (
      <div className={styles.userList}>
        <div className={styles.header}>
          <h2>Participants</h2>
        </div>

        <div className={styles.messages}>
          <h3 className={styles.smallTitle}>Messages</h3>
          <ul>
            <ChatListItem />
          </ul>
        </div>
        <div className={styles.participants}>
          <h3 className={styles.smallTitle}>Participants <small>({this.props.users.length})</small></h3>
          <ul className={styles.list}>
            {this.props.users.map(user => <UserListItem accessibilityLabel={'Status abc'}  accessible={true} key={user.id} user={user}/>)}
          </ul>
        </div>
      </div>
    );
  }
}

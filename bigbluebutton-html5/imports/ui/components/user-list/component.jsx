import React, { Component } from 'react';
import styles from './styles.scss';
import { Link } from 'react-router';
import UserListItem from './user-list-item/component.jsx';
import ChatListItem from './chat-list-item/component.jsx';
import { FormattedMessage } from 'react-intl';

export default class UserList extends Component {
  render() {
    return (
      <div className={styles.userList}>
        <div className={styles.header}>
          <h2>
            <FormattedMessage
              id="app.userlist.participants"
              description="Title for the Header"
              defaultMessage="Participants"
            />
          </h2>
        </div>

        <div className={styles.scrollable}>
          <div className={styles.messages}>
            <h3 className={styles.smallTitle}>
              <FormattedMessage
                id="app.userlist.messages"
                description="Title of messages list"
                defaultMessage="Messages"
              />
            </h3>
            <ul>
              <ChatListItem />
            </ul>
          </div>
          <div className={styles.participants}>
            <h3 className={styles.smallTitle}>
              <FormattedMessage
                id="app.userlist.participants"
                description="Title for the Participants list"
                defaultMessage="Participants"
              />
              <small>
                &nbsp;({this.props.users.length})
              </small>
            </h3>
            <ul className={styles.list}>
              {this.props.users.map(user => <UserListItem accessibilityLabel={'Status abc'}  accessible={true} key={user.id} user={user}/>)}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

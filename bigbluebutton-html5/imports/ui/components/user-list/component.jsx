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
        {this.renderHeader()}
        {this.renderContent()}
      </div>
    );
  }

  renderHeader() {
    return (
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>
          <FormattedMessage
            id="app.userlist.participantsTitle"
            description="Title for the Header"
            defaultMessage="Participants"
          />
        </h2>
      </div>
    )
  }

  renderContent() {
    return (
      <div className={styles.content}>
        {this.renderMessages()}
        {this.renderParticipants()}
      </div>
    );
  }

  renderMessages() {
    return (
      <div className={styles.messages}>
        <h3 className={styles.smallTitle}>
          <FormattedMessage
            id="app.userlist.messagesTitle"
            description="Title of messages list"
            defaultMessage="Messages"
          />
        </h3>
        <ul className={styles.chatsList} tabIndex="1">
          <ChatListItem />
        </ul>
      </div>
    )
  }

  renderParticipants() {
    return (
      <div className={styles.participants}>
        <h3 className={styles.smallTitle}>
          <FormattedMessage
            id="app.userlist.participantsTitle"
            description="Title for the Participants list"
            defaultMessage="Participants"
          />
          &nbsp;({this.props.users.length})
        </h3>
        <ul className={styles.participantsList} tabIndex="1">
          {this.props.users.map(user => <UserListItem accessibilityLabel={'Status abc'}  accessible={true} key={user.id} user={user}/>)}
        </ul>
      </div>
    )
  }
}

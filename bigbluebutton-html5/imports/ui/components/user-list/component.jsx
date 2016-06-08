import React, { Component } from 'react';
import styles from './styles.scss';
import { Link } from 'react-router';
import { withRouter } from 'react-router';
import { FormattedMessage } from 'react-intl';

import UserListItem from './user-list-item/component.jsx';
import ChatListItem from './chat-list-item/component.jsx';

class UserList extends Component {
  constructor(props) {
    super(props);

    this.handleMessageClick = this.handleMessageClick.bind(this);
    this.handleParticipantDblClick = this.handleParticipantDblClick.bind(this);
  }

  handleMessageClick(chatID) {
    this.props.router.push(`/users/chat/${chatID}`);
  }

  handleParticipantDblClick(userID) {
    this.props.router.push(`/users/chat/${userID}`);
  }

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
    );
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
            description="Title for the messages list"
            defaultMessage="Messages"
          />
        </h3>
        <ul className={styles.chatsList} tabIndex="1">
          <ChatListItem onClick={() => this.handleMessageClick('public')} />
        </ul>
      </div>
    );
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
        <div className={styles.scrollableList}>
          <ul className={styles.participantsList} tabIndex="1">
            {this.props.users.map(user => (
              <UserListItem
                onDoubleClick={() => this.handleParticipantDblClick(user.id)}
                accessibilityLabel={'Status abc'}
                accessible={true}
                key={user.id}
                user={user}
              />
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default withRouter(UserList);

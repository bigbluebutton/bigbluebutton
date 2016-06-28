import React, { Component } from 'react';
import { withRouter } from 'react-router';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import styles from './styles.scss';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
let cx = classNames.bind(styles);

import UserListItem from './user-list-item/component.jsx';
import ChatListItem from './chat-list-item/component.jsx';

const listTransition = {
  enter: styles.enter,
  enterActive: styles.enterActive,
  appear: styles.appear,
  appearActive: styles.appearActive,
  leave: styles.leave,
  leaveActive: styles.leaveActive,
};

class UserList extends Component {
  constructor(props) {
    super(props);

    this.handleOpenChatClick = this.handleOpenChatClick.bind(this);
  }

  handleOpenChatClick(chatID) {
    this.props.router.push(`/users/chat/${chatID}`);
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
        <div className={styles.scrollableList}>
          <ReactCSSTransitionGroup
            transitionName={listTransition}
            transitionAppear={true}
            transitionEnter={true}
            transitionLeave={false}
            transitionAppearTimeout={0}
            transitionEnterTimeout={0}
            transitionLeaveTimeout={0}
            component="ul"
            className={cx(styles.chatsList, styles.scrollableList)}
            tabIndex="1">
              {this.props.openChats.map(chat => (
                <ChatListItem
                  key={chat.id}
                  chat={chat} />
              ))}
          </ReactCSSTransitionGroup>
        </div>
      </div>
    );
  }

  renderParticipants() {
    let users = this.props.users;
    let currentUser = this.props.currentUser;
    let actions = this.props.actions;

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
        <ReactCSSTransitionGroup
          transitionName={listTransition}
          transitionAppear={true}
          transitionEnter={true}
          transitionLeave={true}
          transitionAppearTimeout={0}
          transitionEnterTimeout={0}
          transitionLeaveTimeout={0}
          component="ul"
          className={cx(styles.participantsList, styles.scrollableList)}
          tabIndex="1">
          {users.map(user => (
            <UserListItem
              actions={actions}
              key={user.id}
              user={user}
              currentUser={currentUser}
              userActions={this.props.userActions}
            />
          ))}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

export default withRouter(UserList);

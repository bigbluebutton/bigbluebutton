import React, { Component, PropTypes } from 'react';
import { withRouter } from 'react-router';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import styles from './styles.scss';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';
import UserListItem from './user-list-item/component.jsx';
import ChatListItem from './chat-list-item/component.jsx';

const propTypes = {
  openChats: PropTypes.array.isRequired,
  users: PropTypes.array.isRequired,
};

const defaultProps = {
};

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
    this.state = {
      compact: this.props.compact,
    };
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
    const { intl } = this.props;

    return (
      <div className={styles.header}>
        {
          !this.state.compact ?
          <h2 className={styles.headerTitle}>
            {intl.formatMessage(intlMessages.participantsTitle)}
          </h2> : null
        }
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
    const {
      openChats,
      openChat,
      intl,
    } = this.props;

    return (
      <div className={styles.messages}>
        {
          !this.state.compact ?
          <h3 className={styles.smallTitle}>
            {intl.formatMessage(intlMessages.messagesTitle)}
          </h3> : <hr className={styles.separator}></hr>
        }
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
            className={cx(styles.chatsList, styles.scrollableList)}>
              {openChats.map(chat => (
                <ChatListItem
                  compact={this.state.compact}
                  key={chat.id}
                  openChat={openChat}
                  chat={chat} />
              ))}
          </ReactCSSTransitionGroup>
        </div>
      </div>
    );
  }

  renderParticipants() {
    const {
      users,
      currentUser,
      userActions,
      compact,
      isBreakoutRoom,
      intl,
    } = this.props;

    return (
      <div className={styles.participants}>
        {
          !this.state.compact ?
          <h3 className={styles.smallTitle}>
            {intl.formatMessage(intlMessages.usersTitle)}
            &nbsp;({users.length})
          </h3> : <hr className={styles.separator}></hr>
        }
        <ReactCSSTransitionGroup
          transitionName={listTransition}
          transitionAppear={true}
          transitionEnter={true}
          transitionLeave={true}
          transitionAppearTimeout={0}
          transitionEnterTimeout={0}
          transitionLeaveTimeout={0}
          component="ul"
          className={cx(styles.participantsList, styles.scrollableList)}>
          {
            users.map(user => (
            <UserListItem
              compact={this.state.compact}
              key={user.id}
              isBreakoutRoom={isBreakoutRoom}
              user={user}
              currentUser={currentUser}
              userActions={userActions}
            />
          ))}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

const intlMessages = defineMessages({
  usersTitle: {
    id: 'app.userlist.usersTitle',
  },
  messagesTitle: {
    id: 'app.userlist.messagesTitle',
  },
  participantsTitle: {
    id: 'app.userlist.participantsTitle',
  },
});

UserList.propTypes = propTypes;
export default withRouter(injectIntl(UserList));

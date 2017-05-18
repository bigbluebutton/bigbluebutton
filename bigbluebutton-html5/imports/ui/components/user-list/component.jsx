import React, { Component, PropTypes } from 'react';
import { withRouter } from 'react-router';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import styles from './styles.scss';
import cx from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';
import UserListItem from './user-list-item/component.jsx';
import ChatListItem from './chat-list-item/component.jsx';
import KEY_CODES from '/imports/utils/keyCodes';

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

    this.rovingIndex = this.rovingIndex.bind(this);
    this.focusList = this.focusList.bind(this);
    this.focusListItem = this.focusListItem.bind(this);
    this.counter = -1;
  }

  focusList(activeElement, list) {
    activeElement.tabIndex = -1;
    this.counter = 0;
    list.tabIndex = 0;
    list.focus();
  }

  focusListItem(active, direction, element, count) {

    function select() {
      element.tabIndex = 0;
      element.focus();
    }

    active.tabIndex = -1;

    switch (direction) {
      case 'down':
        element.childNodes[this.counter].tabIndex = 0;
        element.childNodes[this.counter].focus();
        this.counter++;
        break;
      case 'up':
        this.counter--;
        element.childNodes[this.counter].tabIndex = 0;
        element.childNodes[this.counter].focus();
        break;
      case 'upLoopUp':
      case 'upLoopDown':
        this.counter = count - 1;
        select();
        break;
      case 'downLoopDown':
        this.counter = -1;
        select();
        break;
      case 'downLoopUp':
        this.counter = 1;
        select();
        break;
    }
  }

  rovingIndex(...Args) {
    const { users, openChats } = this.props;

    let active = document.activeElement;
    let list;
    let items;
    let count;

    switch (Args[1]) {
      case 'users':
        list = this._usersList;
        items = this._userItems;
        count = users.length;
        break;
      case 'messages':
        list = this._msgsList;
        items = this._msgItems;
        count = openChats.length;
        break;
    }

    if (Args[0].keyCode === KEY_CODES.ESCAPE
      || this.counter === -1
      || this.counter > count) {
      this.focusList(active, list);
    }

    if (Args[0].keyCode === KEY_CODES.ENTER
        || Args[0].keyCode === KEY_CODES.ARROW_RIGHT
        || Args[0].keyCode === KEY_CODES.ARROW_LEFT) {
      active.firstChild.click();
    }

    if (Args[0].keyCode === KEY_CODES.ARROW_DOWN) {
      if (this.counter < count) {
        this.focusListItem(active, 'down', items);
      }else if (this.counter === count) {
        this.focusListItem(active, 'downLoopDown', list);
      }else if (this.counter === 0) {
        this.focusListItem(active, 'downLoopUp', list);
      }
    }

    if (Args[0].keyCode === KEY_CODES.ARROW_UP) {
      if (this.counter < count && this.counter !== 0) {
        this.focusListItem(active, 'up', items);
      }else if (this.counter === 0) {
        this.focusListItem(active, 'upLoopUp', list, count);
      }else if (this.counter === count) {
        this.focusListItem(active, 'upLoopDown', list, count);
      }
    }
  }

  componentDidMount() {
    if (!this.state.compact) {
      this._msgsList.addEventListener('keypress',
        event=>this.rovingIndex(event, "messages"));

      this._usersList.addEventListener('keypress',
        event=>this.rovingIndex(event, "users"));
    }
  }

  componentWillUnmount() {
    this._msgsList.removeEventListener('keypress', function (event) {}, false);

    this._usersList.removeEventListener('keypress', function (event) {}, false);
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
          <div className={styles.headerTitle} role="banner">
            {intl.formatMessage(intlMessages.participantsTitle)}
          </div> : null
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
          <div className={styles.smallTitle} role="banner">
            {intl.formatMessage(intlMessages.messagesTitle)}
          </div> : <hr className={styles.separator}></hr>
        }
        <div
          tabIndex={0}
          className={styles.scrollableList}
          ref={(r) => this._msgsList = r}>
          <ReactCSSTransitionGroup
            transitionName={listTransition}
            transitionAppear={true}
            transitionEnter={true}
            transitionLeave={false}
            transitionAppearTimeout={0}
            transitionEnterTimeout={0}
            transitionLeaveTimeout={0}
            component="div"
            className={cx(styles.chatsList, styles.scrollableList)}>
            <div ref={(r) => this._msgItems = r}>
              {openChats.map(chat => (
                <ChatListItem
                  compact={this.state.compact}
                  key={chat.id}
                  openChat={openChat}
                  chat={chat}
                  tabIndex={-1} />
              ))}
            </div>
          </ReactCSSTransitionGroup>
        </div>
      </div>
    );
  }

  renderParticipants() {
    const {
      users,
      currentUser,
      isBreakoutRoom,
      intl,
      makeCall,
      meeting,
    } = this.props;

    const userActions = {
      openChat: {
        label: intl.formatMessage(intlMessages.ChatLabel),
        handler: (router, user) => router.push(`/users/chat/${user.id}`),
        icon: 'chat',
      },
      clearStatus: {
        label: intl.formatMessage(intlMessages.ClearStatusLabel),
        handler: user => makeCall('setEmojiStatus', user.id, 'none'),
        icon: 'clear_status',
      },
      setPresenter: {
        label: intl.formatMessage(intlMessages.MakePresenterLabel),
        handler: user => makeCall('assignPresenter', user.id),
        icon: 'presentation',
      },
      kick: {
        label: intl.formatMessage(intlMessages.KickUserLabel),
        handler: user => makeCall('kickUser', user.id),
        icon: 'circle_close',
      },
      mute: {
        label: intl.formatMessage(intlMessages.MuteUserAudioLabel),
        handler: user => makeCall('muteUser', user.id),
        icon: 'audio_off',
      },
      unmute: {
        label: intl.formatMessage(intlMessages.UnmuteUserAudioLabel),
        handler: user => makeCall('unmuteUser', user.id),
        icon: 'audio_on',
      },
    };

    return (
      <div className={styles.participants}>
        {
          !this.state.compact ?
          <div className={styles.smallTitle} role="banner">
            {intl.formatMessage(intlMessages.usersTitle)}
            &nbsp;({users.length})
          </div> : <hr className={styles.separator}></hr>
        }
        <div
          className={styles.scrollableList}
          tabIndex={0}
          ref={(r) => this._usersList = r}>
          <ReactCSSTransitionGroup
            transitionName={listTransition}
            transitionAppear={true}
            transitionEnter={true}
            transitionLeave={true}
            transitionAppearTimeout={0}
            transitionEnterTimeout={0}
            transitionLeaveTimeout={0}
            component="div"
            className={cx(styles.participantsList, styles.scrollableList)}>
            <div ref={(r) => this._userItems = r}>
              {
                users.map(user => (
                <UserListItem
                  compact={this.state.compact}
                  key={user.id}
                  isBreakoutRoom={isBreakoutRoom}
                  user={user}
                  currentUser={currentUser}
                  userActions={userActions}
                  meeting={meeting}
                />))
              }
            </div>
          </ReactCSSTransitionGroup>
        </div>
      </div>
    );
  }
}

const intlMessages = defineMessages({
  usersTitle: {
    id: 'app.userlist.usersTitle',
    description: 'Title for the Header',
  },
  messagesTitle: {
    id: 'app.userlist.messagesTitle',
    description: 'Title for the messages list',
  },
  participantsTitle: {
    id: 'app.userlist.participantsTitle',
    description: 'Title for the Users list',
  },
  ChatLabel: {
    id: 'app.userlist.menu.chat.label',
    description: 'Save the changes and close the settings menu',
  },
  ClearStatusLabel: {
    id: 'app.userlist.menu.clearStatus.label',
    description: 'Clear the emoji status of this user',
  },
  MakePresenterLabel: {
    id: 'app.userlist.menu.makePresenter.label',
    description: 'Set this user to be the presenter in this meeting',
  },
  KickUserLabel: {
    id: 'app.userlist.menu.kickUser.label',
    description: 'Forcefully remove this user from the meeting',
  },
  MuteUserAudioLabel: {
    id: 'app.userlist.menu.muteUserAudio.label',
    description: 'Forcefully mute this user',
  },
  UnmuteUserAudioLabel: {
    id: 'app.userlist.menu.unmuteUserAudio.label',
    description: 'Forcefully unmute this user',
  },
});

UserList.propTypes = propTypes;
export default withRouter(injectIntl(UserList));

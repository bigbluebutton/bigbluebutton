import React, { Component, PropTypes } from 'react';
import { withRouter } from 'react-router';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import styles from './styles.scss';
import cx from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';
import UserListItem from './user-list-item/component.jsx';
import ChatListItem from './chat-list-item/component.jsx';
import { findDOMNode } from 'react-dom';
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
    this.counter = -1;
  }

  rovingIndex(...Args) {
    const {users, openChats} = this.props;
    let active = document.activeElement;
    let list;
    let items;
    let count;

    function focusList() {
      active.tabIndex = -1;
      this.counter = 0;
      list.tabIndex = 0;
      list.focus();
    }

    if (Args[1] === 'users'){
       list = findDOMNode(this.refs.usersList);
       items = findDOMNode(this.refs.userItems);
       count = users.length;
    }else if(Args[1] === 'messages'){
       list = findDOMNode(this.refs.msgList);
       items = findDOMNode(this.refs.msgItems);
       count = openChats.length;
    }

    if(this.counter === -1){
      list.tabIndex = 0;
      this.counter = 0;
      list.focus();
    }

    if (Args[0].keyCode === KEY_CODES.ENTER
        || Args[0].keyCode === KEY_CODES.ARROW_RIGHT
        || Args[0].keyCode === KEY_CODES.ARROW_LEFT) {
      active.firstChild.click();
    }

    if (Args[0].keyCode === KEY_CODES.ESCAPE) {
      active.tabIndex = -1;
      focusList();
    }

    if (Args[0].keyCode === KEY_CODES.ARROW_DOWN) {
      if (this.counter < count) {
        active.tabIndex = -1;
        items.childNodes[this.counter].tabIndex = 0;
        let newFocus = items.childNodes[this.counter];
        this.counter++;
        newFocus.focus();
      }else if(this.counter === count){
        active.tabIndex = -1;
        this.counter = -1;
        list.tabIndex = 0;
        list.focus();
      }else if(this.counter === 0) {
        active.tabIndex = -1;
        this.counter = 1;
        items.childNodes[this.counter].tabIndex = 0;
        let newFocus = items.childNodes[this.counter];
        newFocus.focus();
      }
    }

    if (Args[0].keyCode === KEY_CODES.ARROW_UP) {
      if (this.counter < count && this.counter !== 0) {
        active.tabIndex = -1;
        this.counter--;
        items.childNodes[this.counter].tabIndex = 0;
        let newFocus = items.childNodes[this.counter];
        newFocus.focus();
      }else if(this.counter === 0){
        active.tabIndex = -1;
        this.counter = count;
        list.tabIndex = 0;
        list.focus();
      }else if (this.counter === count){
        active.tabIndex = -1;
        this.counter = count - 1;
        items.childNodes[this.counter].tabIndex = 0;
        let newFocus = items.childNodes[this.counter];
        newFocus.focus();
      }
    }
  }

  componentDidMount() {
    let _this = this;

    if (!this.state.compact) {
      this.refs.msgList.addEventListener("keypress", function(event) {
        _this.rovingIndex.call(this, event, "messages");
      });

      this.refs.usersList.addEventListener("keypress", function(event) {
        _this.rovingIndex.call(this, event, "users");
      });
    }
  }

  componentWillUnmount() {
    this.refs.msgList.removeEventListener("keypress", function(event){}, false);
    this.refs.usersList.removeEventListener("keypress", function(event){}, false);
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
        <div className={styles.scrollableList} tabIndex={0} ref={'msgList'}>
          <ReactCSSTransitionGroup
            transitionName={listTransition}
            transitionAppear={true}
            transitionEnter={true}
            transitionLeave={false}
            transitionAppearTimeout={0}
            transitionEnterTimeout={0}
            transitionLeaveTimeout={0}
            component="ul"
            className={cx(styles.chatsList, styles.scrollableList)} ref={'msgItems'}>
              {openChats.map(chat => (
                <ChatListItem
                  compact={this.state.compact}
                  key={chat.id}
                  openChat={openChat}
                  chat={chat}
                  tabIndex={-1} />
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
      isBreakoutRoom,
      intl,
      callServer,
    } = this.props;

    const userActions = {
      openChat: {
        label: intl.formatMessage(intlMessages.ChatLabel),
        handler: (router, user) => router.push(`/users/chat/${user.id}`),
        icon: 'chat',
      },
      clearStatus: {
        label: intl.formatMessage(intlMessages.ClearStatusLabel),
        handler: user => callServer('setEmojiStatus', user.id, 'none'),
        icon: 'clear_status',
      },
      setPresenter: {
        label: intl.formatMessage(intlMessages.MakePresenterLabel),
        handler: user => callServer('assignPresenter', user.id),
        icon: 'presentation',
      },
      kick: {
        label: intl.formatMessage(intlMessages.KickUserLabel),
        handler: user => callServer('kickUser', user.id),
        icon: 'circle_close',
      },
      mute: {
        label: intl.formatMessage(intlMessages.MuteUserAudioLabel),
        handler: user => callServer('muteUser', user.id),
        icon: 'audio_off',
      },
      unmute: {
        label: intl.formatMessage(intlMessages.UnmuteUserAudioLabel),
        handler: user => callServer('unmuteUser', user.id),
        icon: 'audio_on',
      },
    };

    return (
      <div className={styles.participants}>
        {
          !this.state.compact ?
          <h3 className={styles.smallTitle}>
            {intl.formatMessage(intlMessages.usersTitle)}
            &nbsp;({users.length})
          </h3> : <hr className={styles.separator}></hr>
        }
        <div className={styles.scrollableList} tabIndex={0} ref={'usersList'}>
        <ReactCSSTransitionGroup
          transitionName={listTransition}
          transitionAppear={true}
          transitionEnter={true}
          transitionLeave={true}
          transitionAppearTimeout={0}
          transitionEnterTimeout={0}
          transitionLeaveTimeout={0}
          component="ul"
          className={cx(styles.participantsList, styles.scrollableList)} ref={'userItems'}>
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

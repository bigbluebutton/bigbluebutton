import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import cx from 'classnames';

import KEY_CODES from '/imports/utils/keyCodes';
import Button from '/imports/ui/components/button/component';

import styles from './styles.scss';

import UserListItem from './user-list-item/component';
import ChatListItem from './chat-list-item/component';

const propTypes = {
  openChats: PropTypes.array.isRequired,
  users: PropTypes.array.isRequired,
  compact: PropTypes.bool,
};

const defaultProps = {
  compact: false,
};

const listTransition = {
  enter: styles.enter,
  enterActive: styles.enterActive,
  appear: styles.appear,
  appearActive: styles.appearActive,
  leave: styles.leave,
  leaveActive: styles.leaveActive,
};

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
  toggleCompactView: {
    id: 'app.userlist.toggleCompactView.label',
    description: 'Toggle user list view mode',
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

class UserList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      compact: this.props.compact,
    };

    this.handleToggleCompactView = this.handleToggleCompactView.bind(this);

    this.rovingIndex = this.rovingIndex.bind(this);
    this.focusList = this.focusList.bind(this);
    this.focusedItemIndex = -1;
  }

  focusList(list) {
    document.activeElement.tabIndex = -1;
    this.focusedItemIndex = -1;
    list.tabIndex = 0;
    list.focus();
  }

  rovingIndex(event, listType) {
    const { users, openChats } = this.props;

    const active = document.activeElement;
    let list;
    let items;
    let numberOfItems;

    const focusElement = () => {
      active.tabIndex = -1;
      items.childNodes[this.focusedItemIndex].tabIndex = 0;
      items.childNodes[this.focusedItemIndex].focus();
    };

    switch (listType) {
      case 'users':
        list = this._usersList;
        items = this._userItems;
        numberOfItems = users.length;
        break;
      case 'messages':
        list = this._msgsList;
        items = this._msgItems;
        numberOfItems = openChats.length;
        break;
      default: break;
    }

    if (event.keyCode === KEY_CODES.ESCAPE
      || this.focusedItemIndex < 0
      || this.focusedItemIndex > numberOfItems) {
      this.focusList(list);
    }

    if ([KEY_CODES.ARROW_RIGHT, KEY_CODES.ARROW_SPACE].includes(event.keyCode)) {
      active.firstChild.click();
    }

    if (event.keyCode === KEY_CODES.ARROW_DOWN) {
      this.focusedItemIndex += 1;

      if (this.focusedItemIndex === numberOfItems) {
        this.focusedItemIndex = 0;
      }
      focusElement();
    }

    if (event.keyCode === KEY_CODES.ARROW_UP) {
      this.focusedItemIndex -= 1;

      if (this.focusedItemIndex < 0) {
        this.focusedItemIndex = numberOfItems - 1;
      }

      focusElement();
    }
  }

  handleToggleCompactView() {
    this.setState({ compact: !this.state.compact });
  }

  componentDidMount() {
    if (!this.state.compact) {
      this._msgsList.addEventListener('keydown',
        event => this.rovingIndex(event, 'messages'));

      this._usersList.addEventListener('keydown',
        event => this.rovingIndex(event, 'users'));
    }
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
        {/* <Button
          label={intl.formatMessage(intlMessages.toggleCompactView)}
          hideLabel
          icon={!this.state.compact ? 'left_arrow' : 'right_arrow'}
          className={styles.btnToggle}
          onClick={this.handleToggleCompactView}
        /> */}
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
            </div> : <hr className={styles.separator} />
        }
        <div
          tabIndex={0}
          className={styles.scrollableList}
          ref={(ref) => { this._msgsList = ref; }}
        >
          <CSSTransitionGroup
            transitionName={listTransition}
            transitionAppear
            transitionEnter
            transitionLeave={false}
            transitionAppearTimeout={0}
            transitionEnterTimeout={0}
            transitionLeaveTimeout={0}
            component="div"
            className={cx(styles.chatsList, styles.scrollableList)}
          >
            <div ref={(ref) => { this._msgItems = ref; }}>
              {openChats.map(chat => (
                <ChatListItem
                  compact={this.state.compact}
                  key={chat.id}
                  openChat={openChat}
                  chat={chat}
                  tabIndex={-1}
                />
              ))}
            </div>
          </CSSTransitionGroup>
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
        handler: user => makeCall('toggleVoice', user.id),
        icon: 'audio_off',
      },
      unmute: {
        label: intl.formatMessage(intlMessages.UnmuteUserAudioLabel),
        handler: user => makeCall('toggleVoice', user.id),
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
          </div> : <hr className={styles.separator} />
        }
        <div
          className={styles.scrollableList}
          tabIndex={0}
          ref={(ref) => { this._usersList = ref; }}
        >
          <CSSTransitionGroup
            transitionName={listTransition}
            transitionAppear
            transitionEnter
            transitionLeave
            transitionAppearTimeout={0}
            transitionEnterTimeout={0}
            transitionLeaveTimeout={0}
            component="div"
            className={cx(styles.participantsList, styles.scrollableList)}
          >
            <div ref={(ref) => { this._userItems = ref; }}>
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
                  />
                ))
              }
            </div>
          </CSSTransitionGroup>
        </div>
      </div>
    );
  }
  
  render() {
    return (
      <div className={styles.userList}>
        {this.renderHeader()}
        {this.renderContent()}
      </div>
    );
  }
}

UserList.propTypes = propTypes;
UserList.defaultProps = defaultProps;

export default withRouter(injectIntl(UserList));

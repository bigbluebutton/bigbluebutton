import React, { Component } from 'react';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import cx from 'classnames';
import styles from './../../styles.scss';
import UserListItem from './user-list-item/component';

const propTypes = {
  users: PropTypes.array.isRequired,
  compact: PropTypes.bool,
  intl: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  meeting: PropTypes.object,
  isBreakoutRoom: PropTypes.bool,
  makeCall: PropTypes.func.isRequired,
  getAvailableActions: PropTypes.func.isRequired,
  normalizeEmojiName: PropTypes.func.isRequired,
  rovingIndex: PropTypes.func.isRequired,
};

const defaultProps = {
  compact: false,
  isBreakoutRoom: false,
  // This one is kinda tricky, meteor takes sometime to fetch the data and passing down
  // So the first time its create, the meeting comes as null, sending an error to the client.
  meeting: {},
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
  PromoteUserLabel: {
    id: 'app.userlist.menu.promoteUser.label',
    description: 'Forcefully promote this viewer to a moderator',
  },
  DemoteUserLabel: {
    id: 'app.userlist.menu.demoteUser.label',
    description: 'Forcefully demote this moderator to a viewer',
  },
});

class UserParticipants extends Component {

  componentDidMount() {
    if (!this.props.compact) {
      this._usersList.addEventListener('keydown',
        event => this.props.rovingIndex(event,
          this._usersList,
          this._userItems,
          this.props.users.length));
    }
  }

  render() {
    const {
      users,
      currentUser,
      isBreakoutRoom,
      intl,
      makeCall,
      meeting,
      getAvailableActions,
      normalizeEmojiName,
      compact,
    } = this.props;

    const userActions =
      {
        openChat: {
          label: () => intl.formatMessage(intlMessages.ChatLabel),
          handler: (router, user) => router.push(`/users/chat/${user.id}`),
          icon: 'chat',
        },
        clearStatus: {
          label: () => intl.formatMessage(intlMessages.ClearStatusLabel),
          handler: user => makeCall('setEmojiStatus', user.id, 'none'),
          icon: 'clear_status',
        },
        setPresenter: {
          label: () => intl.formatMessage(intlMessages.MakePresenterLabel),
          handler: user => makeCall('assignPresenter', user.id),
          icon: 'presentation',
        },
        kick: {
          label: user => intl.formatMessage(intlMessages.KickUserLabel, { 0: user.name }),
          handler: user => makeCall('kickUser', user.id),
          icon: 'circle_close',
        },
        mute: {
          label: () => intl.formatMessage(intlMessages.MuteUserAudioLabel),
          handler: user => makeCall('toggleVoice', user.id),
          icon: 'audio_off',
        },
        unmute: {
          label: () => intl.formatMessage(intlMessages.UnmuteUserAudioLabel),
          handler: user => makeCall('toggleVoice', user.id),
          icon: 'audio_on',
        },
        promote: {
          label: user => intl.formatMessage(intlMessages.PromoteUserLabel, { 0: user.name }),
          handler: user => makeCall('changeRole', user.id, 'MODERATOR'),
          icon: 'promote',
        },
        demote: {
          label: user => intl.formatMessage(intlMessages.DemoteUserLabel, { 0: user.name }),
          handler: user => makeCall('changeRole', user.id, 'VIEWER'),
          icon: 'user',
        },
      };

    return (
      <div className={styles.participants}>
        {
          !compact ?
            <div className={styles.smallTitle} role="banner">
              {intl.formatMessage(intlMessages.usersTitle)}
              &nbsp;({users.length})
          </div> : <hr className={styles.separator} />
        }
        <div
          className={styles.scrollableList}
          role="tabpanel"
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
                    compact={compact}
                    key={user.id}
                    isBreakoutRoom={isBreakoutRoom}
                    user={user}
                    currentUser={currentUser}
                    userActions={userActions}
                    meeting={meeting}
                    getAvailableActions={getAvailableActions}
                    normalizeEmojiName={normalizeEmojiName}
                  />
                ))
              }
            </div>
          </CSSTransitionGroup>
        </div>
      </div>
    );
  }
}

UserParticipants.propTypes = propTypes;
UserParticipants.defaultProps = defaultProps;

export default UserParticipants;

import React, { Component } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import cx from 'classnames';
import styles from '/imports/ui/components/user-list/user-list-content/styles';
import UserListItem from './user-list-item/component';

const propTypes = {
  users: PropTypes.arrayOf(Object).isRequired,
  compact: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({}).isRequired,
  meeting: PropTypes.shape({}),
  isBreakoutRoom: PropTypes.bool,
  setEmojiStatus: PropTypes.func.isRequired,
  assignPresenter: PropTypes.func.isRequired,
  kickUser: PropTypes.func.isRequired,
  toggleVoice: PropTypes.func.isRequired,
  changeRole: PropTypes.func.isRequired,
  getAvailableActions: PropTypes.func.isRequired,
  normalizeEmojiName: PropTypes.func.isRequired,
  isMeetingLocked: PropTypes.func.isRequired,
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
    id: 'app.userList.usersTitle',
    description: 'Title for the Header',
  },
  ChatLabel: {
    id: 'app.userList.menu.chat.label',
    description: 'Save the changes and close the settings menu',
  },
  ClearStatusLabel: {
    id: 'app.userList.menu.clearStatus.label',
    description: 'Clear the emoji status of this user',
  },
  MakePresenterLabel: {
    id: 'app.userList.menu.makePresenter.label',
    description: 'Set this user to be the presenter in this meeting',
  },
  KickUserLabel: {
    id: 'app.userList.menu.kickUser.label',
    description: 'Forcefully remove this user from the meeting',
  },
  MuteUserAudioLabel: {
    id: 'app.userList.menu.muteUserAudio.label',
    description: 'Forcefully mute this user',
  },
  UnmuteUserAudioLabel: {
    id: 'app.userList.menu.unmuteUserAudio.label',
    description: 'Forcefully unmute this user',
  },
  PromoteUserLabel: {
    id: 'app.userList.menu.promoteUser.label',
    description: 'Forcefully promote this viewer to a moderator',
  },
  DemoteUserLabel: {
    id: 'app.userList.menu.demoteUser.label',
    description: 'Forcefully demote this moderator to a viewer',
  },
});

class UserParticipants extends Component {
  constructor() {
    super();

    this.getScrollContainerRef = this.getScrollContainerRef.bind(this);
  }

  componentDidMount() {
    if (!this.props.compact) {
      this.refScrollContainer.addEventListener(
        'keydown',
        event => this.props.rovingIndex(
          event,
          this.refScrollContainer,
          this.refScrollItems,
          this.props.users.length,
        ),
      );
    }
  }

  getScrollContainerRef() {
    return this.refScrollContainer;
  }

  render() {
    const {
      users,
      currentUser,
      isBreakoutRoom,
      intl,
      meeting,
      getAvailableActions,
      normalizeEmojiName,
      isMeetingLocked,
      compact,
      setEmojiStatus,
      assignPresenter,
      kickUser,
      toggleVoice,
      changeRole,
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
          handler: user => setEmojiStatus(user.id, 'none'),
          icon: 'clear_status',
        },
        setPresenter: {
          label: () => intl.formatMessage(intlMessages.MakePresenterLabel),
          handler: user => assignPresenter(user.id),
          icon: 'presentation',
        },
        kick: {
          label: user => intl.formatMessage(intlMessages.KickUserLabel, { 0: user.name }),
          handler: user => kickUser(user.id),
          icon: 'circle_close',
        },
        mute: {
          label: () => intl.formatMessage(intlMessages.MuteUserAudioLabel),
          handler: user => toggleVoice(user.id),
          icon: 'audio_off',
        },
        unmute: {
          label: () => intl.formatMessage(intlMessages.UnmuteUserAudioLabel),
          handler: user => toggleVoice(user.id),
          icon: 'audio_on',
        },
        promote: {
          label: user => intl.formatMessage(intlMessages.PromoteUserLabel, { 0: user.name }),
          handler: user => changeRole(user.id, 'MODERATOR'),
          icon: 'promote',
        },
        demote: {
          label: user => intl.formatMessage(intlMessages.DemoteUserLabel, { 0: user.name }),
          handler: user => changeRole(user.id, 'VIEWER'),
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
          ref={(ref) => { this.refScrollContainer = ref; }}
        >
          <div ref={(ref) => { this.refScrollItems = ref; }} className={styles.list}>
            <TransitionGroup>
              { users.map(user => (
                <CSSTransition
                  classNames={listTransition}
                  appear
                  enter
                  exit
                  timeout={0}
                  component="div"
                  className={cx(styles.participantsList)}
                  key={user.id}
                >
                  <UserListItem
                    compact={compact}
                    isBreakoutRoom={isBreakoutRoom}
                    user={user}
                    currentUser={currentUser}
                    userActions={userActions}
                    meeting={meeting}
                    getAvailableActions={getAvailableActions}
                    normalizeEmojiName={normalizeEmojiName}
                    isMeetingLocked={isMeetingLocked}
                    getScrollContainerRef={this.getScrollContainerRef}
                  />
                </CSSTransition>
              ))}
            </TransitionGroup>
          </div>
        </div>
      </div>
    );
  }
}

UserParticipants.propTypes = propTypes;
UserParticipants.defaultProps = defaultProps;

export default UserParticipants;

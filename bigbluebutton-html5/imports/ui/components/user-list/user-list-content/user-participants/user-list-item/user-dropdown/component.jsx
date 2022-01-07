import React, { PureComponent } from 'react';
import { defineMessages } from 'react-intl';
import _ from 'lodash';
import { Session } from 'meteor/session';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import cx from 'classnames';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import Icon from '/imports/ui/components/icon/component';
import lockContextContainer from '/imports/ui/components/lock-viewers/context/container';
import { withModalMounter } from '/imports/ui/components/modal/service';
import RemoveUserModal from '/imports/ui/components/modal/remove-user/component';
import VideoService from '/imports/ui/components/video-provider/service';
import BBBMenu from '/imports/ui/components/menu/component';
import { styles } from './styles';
import UserName from '../user-name/component';
import { PANELS, ACTIONS } from '../../../../../layout/enums';
import WhiteboardService from '/imports/ui/components/whiteboard/service';

const messages = defineMessages({
  presenter: {
    id: 'app.userList.presenter',
    description: 'Text for identifying presenter user',
  },
  you: {
    id: 'app.userList.you',
    description: 'Text for identifying your user',
  },
  locked: {
    id: 'app.userList.locked',
    description: 'Text for identifying locked user',
  },
  menuTitleContext: {
    id: 'app.userList.menuTitleContext',
    description: 'adds context to userListItem menu title',
  },
  userAriaLabel: {
    id: 'app.userList.userAriaLabel',
    description: 'aria label for each user in the userlist',
  },
  statusTriggerLabel: {
    id: 'app.actionsBar.emojiMenu.statusTriggerLabel',
    description: 'label for option to show emoji menu',
  },
  backTriggerLabel: {
    id: 'app.audio.backLabel',
    description: 'label for option to hide emoji menu',
  },
  StartPrivateChat: {
    id: 'app.userList.menu.chat.label',
    description: 'label for option to start a new private chat',
  },
  PinUserWebcam: {
    id: 'app.userList.menu.webcamPin.label',
    description: 'label for pin user webcam',
  },
  UnpinUserWebcam: {
    id: 'app.userList.menu.webcamUnpin.label',
    description: 'label for pin user webcam',
  },
  ClearStatusLabel: {
    id: 'app.userList.menu.clearStatus.label',
    description: 'Clear the emoji status of this user',
  },
  takePresenterLabel: {
    id: 'app.actionsBar.actionsDropdown.takePresenter',
    description: 'Set this user to be the presenter in this meeting',
  },
  makePresenterLabel: {
    id: 'app.userList.menu.makePresenter.label',
    description: 'label to make another user presenter',
  },
  giveWhiteboardAccess: {
    id: 'app.userList.menu.giveWhiteboardAccess.label',
    description: 'label to give user whiteboard access',
  },
  removeWhiteboardAccess: {
    id: 'app.userList.menu.removeWhiteboardAccess.label',
    description: 'label to remove user whiteboard access',
  },
  ejectUserCamerasLabel: {
    id: 'app.userList.menu.ejectUserCameras.label',
    description: 'label to eject user cameras',
  },
  RemoveUserLabel: {
    id: 'app.userList.menu.removeUser.label',
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
  UnlockUserLabel: {
    id: 'app.userList.menu.unlockUser.label',
    description: 'Unlock individual user',
  },
  LockUserLabel: {
    id: 'app.userList.menu.lockUser.label',
    description: 'Lock a unlocked user',
  },
  DirectoryLookupLabel: {
    id: 'app.userList.menu.directoryLookup.label',
    description: 'Directory lookup',
  },
  yesLabel: {
    id: 'app.endMeeting.yesLabel',
    description: 'confirm button label',
  },
  noLabel: {
    id: 'app.endMeeting.noLabel',
    description: 'cancel confirm button label',
  },
  removeConfirmTitle: {
    id: 'app.userList.menu.removeConfirmation.label',
    description: 'title for remove user confirmation modal',
  },
  removeConfirmDesc: {
    id: 'app.userlist.menu.removeConfirmation.desc',
    description: 'description for remove user confirmation',
  },
});

const propTypes = {
  compact: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    userId: PropTypes.string.isRequired,
  }).isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  normalizeEmojiName: PropTypes.func.isRequired,
  isThisMeetingLocked: PropTypes.bool.isRequired,
  getScrollContainerRef: PropTypes.func.isRequired,
  toggleUserLock: PropTypes.func.isRequired,
};
const CHAT_ENABLED = Meteor.settings.public.chat.enabled;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

class UserDropdown extends PureComponent {
  /**
   * Return true if the content fit on the screen, false otherwise.
   *
   * @param {number} contentOffSetTop
   * @param {number} contentOffsetHeight
   * @return True if the content fit on the screen, false otherwise.
   */
  static checkIfDropdownIsVisible(contentOffSetTop, contentOffsetHeight) {
    return (contentOffSetTop + contentOffsetHeight) < window.innerHeight;
  }

  constructor(props) {
    super(props);

    this.state = {
      isActionsOpen: false,
      dropdownVisible: false,
      showNestedOptions: false,
      selected: false,
    };

    this.handleScroll = this.handleScroll.bind(this);
    this.onActionsShow = this.onActionsShow.bind(this);
    this.onActionsHide = this.onActionsHide.bind(this);
    this.getDropdownMenuParent = this.getDropdownMenuParent.bind(this);
    this.renderUserAvatar = this.renderUserAvatar.bind(this);
    this.resetMenuState = this.resetMenuState.bind(this);

    this.title = _.uniqueId('dropdown-title-');
    this.seperator = _.uniqueId('action-separator-');
  }

  handleScroll() {
    this.setState({
      isActionsOpen: false,
      showNestedOptions: false,
    });
  }

  handleClose() {
    this.setState({ selected: null });
  }

  onActionsShow() {
    Session.set('dropdownOpen', true);
    const { getScrollContainerRef } = this.props;
    const dropdown = this.getDropdownMenuParent();
    const scrollContainer = getScrollContainerRef();

    if (dropdown && scrollContainer) {
      // eslint-disable-next-line react/no-find-dom-node
      const list = findDOMNode(this.list);
      const children = [].slice.call(list.children);
      children.find((child) => child.getAttribute('role') === 'menuitem').focus();

      this.setState({
        isActionsOpen: true,
        dropdownVisible: false,
      });

      scrollContainer.addEventListener('scroll', this.handleScroll, false);
    }
  }

  onActionsHide(callback) {
    const { getScrollContainerRef } = this.props;

    this.setState({
      isActionsOpen: false,
      dropdownVisible: false,
      showNestedOptions: false,
    });

    const scrollContainer = getScrollContainerRef();
    scrollContainer.removeEventListener('scroll', this.handleScroll, false);

    if (callback) {
      return callback;
    }

    return Session.set('dropdownOpen', false);
  }

  getUsersActions() {
    const {
      intl,
      currentUser,
      user,
      voiceUser,
      getAvailableActions,
      getGroupChatPrivate,
      getEmojiList,
      setEmojiStatus,
      assignPresenter,
      removeUser,
      toggleVoice,
      changeRole,
      ejectUserCameras,
      lockSettingsProps,
      hasPrivateChatBetweenUsers,
      toggleUserLock,
      requestUserInformation,
      isMeteorConnected,
      userLocks,
      isMe,
      meetingIsBreakout,
      mountModal,
      usersProp,
      layoutContextDispatch,
    } = this.props;
    const { showNestedOptions } = this.state;
    const { clientType, isSharingWebcam, pin: userIsPinned } = user;
    const isDialInUser = clientType === 'dial-in-user';

    const amIPresenter = currentUser.presenter;
    const amIModerator = currentUser.role === ROLE_MODERATOR;
    const actionPermissions = getAvailableActions(
      amIModerator, meetingIsBreakout, user, voiceUser, usersProp, amIPresenter,
    );
    const actions = [];

    const {
      allowedToChatPrivately,
      allowedToMuteAudio,
      allowedToUnmuteAudio,
      allowedToResetStatus,
      allowedToRemove,
      allowedToSetPresenter,
      allowedToPromote,
      allowedToDemote,
      allowedToChangeStatus,
      allowedToChangeUserLockStatus,
      allowedToChangeWhiteboardAccess,
      allowedToEjectCameras,
    } = actionPermissions;

    const { disablePrivateChat } = lockSettingsProps;

    const enablePrivateChat = currentUser.role === ROLE_MODERATOR
      ? allowedToChatPrivately
      : allowedToChatPrivately
      && (!(currentUser.locked && disablePrivateChat)
        || hasPrivateChatBetweenUsers(currentUser.userId, user.userId)
        || user.role === ROLE_MODERATOR) && isMeteorConnected;

    const { allowUserLookup } = Meteor.settings.public.app;

    if (showNestedOptions && isMeteorConnected) {
      if (allowedToChangeStatus) {
        actions.push({
          key: 'back',
          label: intl.formatMessage(messages.backTriggerLabel),
          onClick: () => this.setState({ showNestedOptions: false }),
          icon: 'left_arrow',
          divider: true,
        });
      }

      const statuses = Object.keys(getEmojiList);

      statuses.forEach((s) => {
        actions.push({
          key: s,
          label: intl.formatMessage({ id: `app.actionsBar.emojiMenu.${s}Label` }),
          onClick: () => {
            setEmojiStatus(user.userId, s);
            this.resetMenuState();
            this.handleClose();
          },
          icon: getEmojiList[s],
        });
      });
      return actions;
    }

    if (allowedToChangeStatus && isMeteorConnected) {
      actions.push({
        key: 'setstatus',
        label: intl.formatMessage(messages.statusTriggerLabel),
        onClick: () => this.setState({ showNestedOptions: true }),
        icon: 'user',
        iconRight: 'right_arrow',
      });
    }

    if (isSharingWebcam
      && isMeteorConnected
      && VideoService.isVideoPinEnabledForCurrentUser()) {
      actions.push({
        key: 'pinVideo',
        label: userIsPinned
          ? intl.formatMessage(messages.UnpinUserWebcam)
          : intl.formatMessage(messages.PinUserWebcam),
        onClick: () => {
          VideoService.toggleVideoPin(user.userId, userIsPinned);
        },
        icon: userIsPinned ? 'pin-video_off' : 'pin-video_on',
      });
    }

    const showChatOption = CHAT_ENABLED
      && enablePrivateChat
      && !isDialInUser
      && !meetingIsBreakout
      && isMeteorConnected;

    if (showChatOption) {
      actions.push({
        key: 'activeChat',
        label: intl.formatMessage(messages.StartPrivateChat),
        onClick: () => {
          this.handleClose();
          getGroupChatPrivate(currentUser.userId, user);
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
            value: true,
          });
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
            value: PANELS.CHAT,
          });
          layoutContextDispatch({
            type: ACTIONS.SET_ID_CHAT_OPEN,
            value: user.userId,
          });
        },
        icon: 'chat',
      });
    }

    if (allowedToResetStatus && user.emoji !== 'none' && isMeteorConnected) {
      actions.push({
        key: 'clearStatus',
        label: intl.formatMessage(messages.ClearStatusLabel),
        onClick: () => {
          this.onActionsHide(setEmojiStatus(user.userId, 'none'));
          this.handleClose();
        },
        icon: 'clear_status',
      });
    }

    if (allowedToMuteAudio && isMeteorConnected && !meetingIsBreakout) {
      actions.push({
        key: 'mute',
        label: intl.formatMessage(messages.MuteUserAudioLabel),
        onClick: () => {
          this.onActionsHide(toggleVoice(user.userId));
          this.handleClose();
        },
        icon: 'mute',
      });
    }

    if (allowedToUnmuteAudio && !userLocks.userMic && isMeteorConnected && !meetingIsBreakout) {
      actions.push({
        key: 'unmute',
        label: intl.formatMessage(messages.UnmuteUserAudioLabel),
        onClick: () => {
          this.onActionsHide(toggleVoice(user.userId));
          this.handleClose();
        },
        icon: 'unmute',
      });
    }

    if (allowedToChangeWhiteboardAccess && !user.presenter && isMeteorConnected && !isDialInUser) {
      const label = user.whiteboardAccess
        ? intl.formatMessage(messages.removeWhiteboardAccess)
        : intl.formatMessage(messages.giveWhiteboardAccess);

      actions.push({
        key: 'changeWhiteboardAccess',
        label,
        onClick: () => {
          WhiteboardService.changeWhiteboardAccess(user.userId, !user.whiteboardAccess);
          this.handleClose();
        },
        icon: 'pen_tool',
      });
    }

    if (allowedToSetPresenter && isMeteorConnected && !isDialInUser) {
      actions.push({
        key: 'setPresenter',
        label: isMe(user.userId)
          ? intl.formatMessage(messages.takePresenterLabel)
          : intl.formatMessage(messages.makePresenterLabel),
        onClick: () => {
          this.onActionsHide(assignPresenter(user.userId));
          this.handleClose();
        },
        icon: 'presentation',
      });
    }

    if (allowedToPromote && isMeteorConnected) {
      actions.push({
        key: 'promote',
        label: intl.formatMessage(messages.PromoteUserLabel),
        onClick: () => {
          this.onActionsHide(changeRole(user.userId, 'MODERATOR'));
          this.handleClose();
        },
        icon: 'promote',
      });
    }

    if (allowedToDemote && isMeteorConnected) {
      actions.push({
        key: 'demote',
        label: intl.formatMessage(messages.DemoteUserLabel),
        onClick: () => {
          this.onActionsHide(changeRole(user.userId, 'VIEWER'));
          this.handleClose();
        },
        icon: 'user',
      });
    }

    if (allowedToChangeUserLockStatus && isMeteorConnected) {
      const userLocked = user.locked && user.role !== ROLE_MODERATOR;

      actions.push({
        key: 'unlockUser',
        label: userLocked ? intl.formatMessage(messages.UnlockUserLabel, { 0: user.name })
          : intl.formatMessage(messages.LockUserLabel, { 0: user.name }),
        onClick: () => {
          this.onActionsHide(toggleUserLock(user.userId, !userLocked));
          this.handleClose();
        },
        icon: userLocked ? 'unlock' : 'lock',
      });
    }

    if (allowUserLookup && isMeteorConnected) {
      actions.push({
        key: 'directoryLookup',
        label: intl.formatMessage(messages.DirectoryLookupLabel),
        onClick: () => {
          this.onActionsHide(requestUserInformation(user.extId));
          this.handleClose();
        },
        icon: 'user',
      });
    }

    if (allowedToRemove && isMeteorConnected) {
      actions.push({
        key: 'remove',
        label: intl.formatMessage(messages.RemoveUserLabel, { 0: user.name }),
        onClick: () => {
          this.onActionsHide(mountModal(
            <RemoveUserModal
              intl={intl}
              user={user}
              onConfirm={removeUser}
            />,
          ));

          this.handleClose();
        },
        icon: 'circle_close',
      });
    }

    if (allowedToEjectCameras
      && user.isSharingWebcam
      && isMeteorConnected
      && !meetingIsBreakout
    ) {
      actions.push({
        key: 'ejectUserCameras',
        label: intl.formatMessage(messages.ejectUserCamerasLabel),
        onClick: () => {
          this.onActionsHide(ejectUserCameras(user.userId));
          this.handleClose();
        },
        icon: 'video_off',
      });
    }

    return actions;
  }

  getDropdownMenuParent() {
    // eslint-disable-next-line react/no-find-dom-node
    return findDOMNode(this.dropdown);
  }

  resetMenuState() {
    return this.setState({
      isActionsOpen: false,
      dropdownVisible: false,
      showNestedOptions: false,
      selected: false,
    });
  }

  /**
   * Check if the dropdown is visible, if so, check if should be draw on top or bottom direction.
   */
  checkDropdownDirection() {
    if (this.isDropdownActivedByUser()) {
      const nextState = {
        dropdownVisible: true,
      };

      this.setState(nextState);
    }
  }

  /**
  * Check if the dropdown is visible and is opened by the user
  *
  * @return True if is visible and opened by the user
  */
  isDropdownActivedByUser() {
    const { isActionsOpen, dropdownVisible } = this.state;

    return isActionsOpen && !dropdownVisible;
  }

  renderUserAvatar() {
    const {
      normalizeEmojiName,
      user,
      userInBreakout,
      breakoutSequence,
      meetingIsBreakout,
      voiceUser,
    } = this.props;

    const { clientType } = user;
    const isVoiceOnly = clientType === 'dial-in-user';

    const iconUser = user.emoji !== 'none'
      ? (<Icon iconName={normalizeEmojiName(user.emoji)} />)
      : user.name.toLowerCase().slice(0, 2);

    const iconVoiceOnlyUser = (<Icon iconName="volume_level_2" />);
    const userIcon = isVoiceOnly ? iconVoiceOnlyUser : iconUser;

    return (
      <UserAvatar
        moderator={user.role === ROLE_MODERATOR}
        presenter={user.presenter}
        talking={voiceUser.isTalking}
        muted={voiceUser.isMuted}
        listenOnly={voiceUser.isListenOnly}
        voice={voiceUser.isVoiceUser}
        noVoice={!voiceUser.isVoiceUser}
        color={user.color}
        whiteboardAccess={user.whiteboardAccess}
        emoji={user.emoji !== 'none'}
        avatar={user.avatar}
      >
        {
          userInBreakout
            && !meetingIsBreakout
            ? breakoutSequence : userIcon
        }
      </UserAvatar>
    );
  }

  render() {
    const {
      compact,
      user,
      intl,
      isThisMeetingLocked,
      isMe,
      isRTL,
    } = this.props;

    const {
      isActionsOpen,
      selected,
    } = this.state;

    const actions = this.getUsersActions();

    const userItemContentsStyle = {};

    userItemContentsStyle[styles.selected] = selected === true;
    userItemContentsStyle[styles.dropdown] = true;
    userItemContentsStyle[styles.userListItem] = !isActionsOpen;
    userItemContentsStyle[styles.usertListItemWithMenu] = isActionsOpen;

    const you = isMe(user.userId) ? intl.formatMessage(messages.you) : '';

    const presenter = (user.presenter)
      ? intl.formatMessage(messages.presenter)
      : '';

    const userAriaLabel = intl.formatMessage(
      messages.userAriaLabel,
      {
        0: user.name,
        1: presenter,
        2: you,
        3: user.emoji,
      },
    );

    const contents = (
      <div
        data-test={isMe(user.userId) ? 'userListItemCurrent' : 'userListItem'}
        className={!actions.length ? styles.noActionsListItem : null}
        style={{ direction: isRTL ? 'rtl' : 'ltr', width: '100%' }}
      >
        <div className={styles.userItemContents}>
          <div className={styles.userAvatar}>
            {this.renderUserAvatar()}
          </div>
          <UserName
            {...{
              user,
              compact,
              intl,
              isThisMeetingLocked,
              userAriaLabel,
              isActionsOpen,
              isMe,
            }}
          />
        </div>
      </div>
    );

    if (!actions.length) return contents;

    return (
      <BBBMenu
        trigger={
          (
            <div
              tabIndex={-1}
              onClick={() => this.setState({ selected: true })}
              className={cx(userItemContentsStyle)}
              style={{ width: '100%', marginLeft: '.5rem' }}
              onKeyPress={() => {}}
              role="button"
            >
              {contents}
            </div>
          )
        }
        actions={actions}
        selectedEmoji={user.emoji}
        onCloseCallback={() => this.setState({ selected: false, showNestedOptions: false })}
      />
    );
  }
}

UserDropdown.propTypes = propTypes;
export default withModalMounter(lockContextContainer(UserDropdown));

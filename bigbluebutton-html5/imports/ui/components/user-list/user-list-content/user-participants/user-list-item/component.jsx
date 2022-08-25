import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import _ from 'lodash';
import { Session } from 'meteor/session';
import { findDOMNode } from 'react-dom';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import Icon from '/imports/ui/components/common/icon/component';
import lockContextContainer from '/imports/ui/components/lock-viewers/context/container';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import ConfirmationModal from '/imports/ui/components/common/modal/confirmation/component';
import VideoService from '/imports/ui/components/video-provider/service';
import BBBMenu from '/imports/ui/components/common/menu/component';
import Styled from './styles';
import { PANELS, ACTIONS } from '../../../../layout/enums';
import WhiteboardService from '/imports/ui/components/whiteboard/service';
import { isChatEnabled } from '/imports/ui/services/features';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

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
  moderator: {
    id: 'app.userList.moderator',
    description: 'Text for identifying moderator user',
  },
  mobile: {
    id: 'app.userList.mobile',
    description: 'Text for identifying mobile user',
  },
  guest: {
    id: 'app.userList.guest',
    description: 'Text for identifying guest user',
  },
  sharingWebcam: {
    id: 'app.userList.sharingWebcam',
    description: 'Text for identifying who is sharing webcam',
  },
  breakoutRoom: {
    id: 'app.createBreakoutRoom.room',
    description: 'breakout room',
  },
});

const propTypes = {
  compact: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    pin: PropTypes.bool.isRequired,
  }),
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  getAvailableActions: PropTypes.func.isRequired,
  isThisMeetingLocked: PropTypes.bool.isRequired,
  normalizeEmojiName: PropTypes.func.isRequired,
  getScrollContainerRef: PropTypes.func.isRequired,
  toggleUserLock: PropTypes.func.isRequired,
  isMeteorConnected: PropTypes.bool.isRequired,
  isMe: PropTypes.func.isRequired,
};

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
const LABEL = Meteor.settings.public.user.label;

class UserListItem extends PureComponent {
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

  componentDidUpdate() {
    const { user, selectedUserId } = this.props;
    const { selected } = this.state;
    if (selectedUserId === user?.userId && !selected) {
      this.setState({ selected: true });
    } else if (selectedUserId !== user?.userId && selected) {
      this.setState({ selected: false });
    }
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

    if (!user) return [];

    const { clientType, isSharingWebcam, pin: userIsPinned } = user;
    const isDialInUser = clientType === 'dial-in-user';

    const amIPresenter = currentUser.presenter;
    const amIModerator = currentUser.role === ROLE_MODERATOR;
    const actionPermissions = getAvailableActions(
      amIModerator, meetingIsBreakout, user, voiceUser, usersProp, amIPresenter,
    );

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
    const userLocked = user.locked && user.role !== ROLE_MODERATOR;

    const availableActions = [
      {
        allowed: allowedToChangeStatus && !showNestedOptions && isMeteorConnected,
        key: 'setstatus',
        label: intl.formatMessage(messages.statusTriggerLabel),
        onClick: () => this.setState({ showNestedOptions: true }),
        icon: 'user',
        iconRight: 'right_arrow',
        dataTest: 'setStatus',
      },
      {
        allowed: showNestedOptions && isMeteorConnected && allowedToChangeStatus,
        key: 'back',
        label: intl.formatMessage(messages.backTriggerLabel),
        onClick: () => this.setState({ showNestedOptions: false }),
        icon: 'left_arrow',
        divider: true,
      },
      {
        allowed: isSharingWebcam
          && isMeteorConnected
          && VideoService.isVideoPinEnabledForCurrentUser()
          && !showNestedOptions,
        key: 'pinVideo',
        label: userIsPinned
          ? intl.formatMessage(messages.UnpinUserWebcam)
          : intl.formatMessage(messages.PinUserWebcam),
        onClick: () => {
          VideoService.toggleVideoPin(user.userId, userIsPinned);
        },
        icon: userIsPinned ? 'pin-video_off' : 'pin-video_on',
      },
      {
        allowed: isChatEnabled()
          && enablePrivateChat
          && !isDialInUser
          && !meetingIsBreakout
          && isMeteorConnected
          && !showNestedOptions,
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
        dataTest: 'startPrivateChat',
      },
      {
        allowed: allowedToResetStatus
          && user.emoji !== 'none'
          && isMeteorConnected
          && !showNestedOptions,
        key: 'clearStatus',
        label: intl.formatMessage(messages.ClearStatusLabel),
        onClick: () => {
          this.onActionsHide(setEmojiStatus(user.userId, 'none'));
          this.handleClose();
        },
        icon: 'clear_status',
      },
      {
        allowed: allowedToMuteAudio
          && isMeteorConnected
          && !meetingIsBreakout
          && !showNestedOptions,
        key: 'mute',
        label: intl.formatMessage(messages.MuteUserAudioLabel),
        onClick: () => {
          this.onActionsHide(toggleVoice(user.userId));
          this.handleClose();
        },
        icon: 'mute',
      },
      {
        allowed: allowedToUnmuteAudio
          && !userLocks.userMic
          && isMeteorConnected
          && !meetingIsBreakout
          && !showNestedOptions,
        key: 'unmute',
        label: intl.formatMessage(messages.UnmuteUserAudioLabel),
        onClick: () => {
          this.onActionsHide(toggleVoice(user.userId));
          this.handleClose();
        },
        icon: 'unmute',
      },
      {
        allowed: allowedToChangeWhiteboardAccess
          && !user.presenter
          && isMeteorConnected
          && !isDialInUser
          && !showNestedOptions,
        key: 'changeWhiteboardAccess',
        label: user.whiteboardAccess
          ? intl.formatMessage(messages.removeWhiteboardAccess)
          : intl.formatMessage(messages.giveWhiteboardAccess),
        onClick: () => {
          WhiteboardService.changeWhiteboardAccess(user.userId, !user.whiteboardAccess);
          this.handleClose();
        },
        icon: 'pen_tool',
        dataTest: 'changeWhiteboardAccess',
      },
      {
        allowed: allowedToSetPresenter && isMeteorConnected && !isDialInUser && !showNestedOptions,
        key: 'setPresenter',
        label: isMe(user.userId)
          ? intl.formatMessage(messages.takePresenterLabel)
          : intl.formatMessage(messages.makePresenterLabel),
        onClick: () => {
          this.onActionsHide(assignPresenter(user.userId));
          this.handleClose();
        },
        icon: 'presentation',
        dataTest: isMe(user.userId) ? 'takePresenter' : 'makePresenter',
      },
      {
        allowed: allowedToPromote && isMeteorConnected && !showNestedOptions,
        key: 'promote',
        label: intl.formatMessage(messages.PromoteUserLabel),
        onClick: () => {
          this.onActionsHide(changeRole(user.userId, 'MODERATOR'));
          this.handleClose();
        },
        icon: 'promote',
        dataTest: 'promoteToModerator',
      },
      {
        allowed: allowedToDemote && isMeteorConnected && !showNestedOptions,
        key: 'demote',
        label: intl.formatMessage(messages.DemoteUserLabel),
        onClick: () => {
          this.onActionsHide(changeRole(user.userId, 'VIEWER'));
          this.handleClose();
        },
        icon: 'user',
        dataTest: 'demoteToViewer',
      },
      {
        allowed: allowedToChangeUserLockStatus && isMeteorConnected && !showNestedOptions,
        key: 'unlockUser',
        label: userLocked ? intl.formatMessage(messages.UnlockUserLabel, { 0: user.name })
          : intl.formatMessage(messages.LockUserLabel, { 0: user.name }),
        onClick: () => {
          this.onActionsHide(toggleUserLock(user.userId, !userLocked));
          this.handleClose();
        },
        icon: userLocked ? 'unlock' : 'lock',
        dataTest: 'unlockUserButton',
      },
      {
        allowed: allowUserLookup && isMeteorConnected && !showNestedOptions,
        key: 'directoryLookup',
        label: intl.formatMessage(messages.DirectoryLookupLabel),
        onClick: () => {
          this.onActionsHide(requestUserInformation(user.extId));
          this.handleClose();
        },
        icon: 'user',
      },
      {
        allowed: allowedToRemove && isMeteorConnected && !showNestedOptions,
        key: 'remove',
        label: intl.formatMessage(messages.RemoveUserLabel, { 0: user.name }),
        onClick: () => {
          this.onActionsHide(mountModal(
            <ConfirmationModal
              intl={intl}
              titleMessageId="app.userList.menu.removeConfirmation.label"
              titleMessageExtra={user.name}
              checkboxMessageId="app.userlist.menu.removeConfirmation.desc"
              confirmParam={user.userId}
              onConfirm={removeUser}
            />,
          ));

          this.handleClose();
        },
        icon: 'circle_close',
      },
      {
        allowed: allowedToEjectCameras
          && user.isSharingWebcam
          && isMeteorConnected
          && !meetingIsBreakout
          && !showNestedOptions,
        key: 'ejectUserCameras',
        label: intl.formatMessage(messages.ejectUserCamerasLabel),
        onClick: () => {
          this.onActionsHide(ejectUserCameras(user.userId));
          this.handleClose();
        },
        icon: 'video_off',
      },
    ];

    const statuses = Object.keys(getEmojiList);

    statuses.forEach((s) => {
      availableActions.push({
        allowed: showNestedOptions && isMeteorConnected,
        key: s,
        label: intl.formatMessage({ id: `app.actionsBar.emojiMenu.${s}Label` }),
        onClick: () => {
          setEmojiStatus(user.userId, s);
          this.resetMenuState();
          this.handleClose();
        },
        icon: getEmojiList[s],
        dataTest: s,
      });
    });

    return availableActions.filter((action) => action.allowed);
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
      userInBreakout,
      userLastBreakout,
      isMe,
      isRTL,
      selectedUserId,
    } = this.props;

    const {
      isActionsOpen,
      selected,
    } = this.state;

    if (!user) return (
      <Styled.SkeletonUserItemContents>
        <SkeletonTheme baseColor="#DCE4EC">
          <div style={{ direction: isRTL ? 'rtl' : 'ltr', width: '100%' }}>
            <Styled.UserItemInnerContents>
              <Styled.UserAvatar data-test="userAvatar">
                <UserAvatar isSkeleton={true}>
                  <Skeleton circle="true"/>
                </UserAvatar>
              </Styled.UserAvatar>
              <Styled.UserName>
                <Styled.UserNameMain>
                  <Styled.SkeletonWrapper>
                    <Skeleton />
                  </Styled.SkeletonWrapper>
                </Styled.UserNameMain>
                <Styled.UserNameSub>
                  <Styled.SkeletonWrapper>
                    <Skeleton />
                  </Styled.SkeletonWrapper>
                </Styled.UserNameSub>
              </Styled.UserName>
            </Styled.UserItemInnerContents>
          </div>
        </SkeletonTheme>
      </Styled.SkeletonUserItemContents>
    );

    const actions = this.getUsersActions();

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

    const userNameSub = [];

    if (user.isSharingWebcam && LABEL.sharingWebcam) {
      userNameSub.push(
        <span key={_.uniqueId('video-')}>
          { user.pin === true
            ? <Icon iconName="pin-video_on" />
            : <Icon iconName="video" /> }
          &nbsp;
          {intl.formatMessage(messages.sharingWebcam)}
        </span>,
      );
    }

    if (isThisMeetingLocked && user.locked && user.role !== ROLE_MODERATOR) {
      userNameSub.push(
        <span key={_.uniqueId('lock-')}>
          <Icon iconName="lock" />
          &nbsp;
          {intl.formatMessage(messages.locked)}
        </span>,
      );
    }

    if (user.role === ROLE_MODERATOR) {
      if (LABEL.moderator) userNameSub.push(intl.formatMessage(messages.moderator));
    }

    if (user.mobile) {
      if (LABEL.mobile) userNameSub.push(intl.formatMessage(messages.mobile));
    }

    if (user.guest) {
      if (LABEL.guest) userNameSub.push(intl.formatMessage(messages.guest));
    }

    if (userInBreakout && userLastBreakout) {
      userNameSub.push(
        <span key={_.uniqueId('breakout-')}>
          <Icon iconName="rooms" />
          &nbsp;
          {userLastBreakout.isDefaultName
            ? intl.formatMessage(messages.breakoutRoom, { 0: userLastBreakout.sequence })
            : userLastBreakout.shortName}
        </span>,
      );
    }

    const innerContents = (
      <Styled.UserItemInnerContents>
        <Styled.UserAvatar data-test="userAvatar" data-test-presenter={user.presenter ? '' : undefined}>
          {this.renderUserAvatar()}
        </Styled.UserAvatar>
        {!compact
          ? (
            <Styled.UserName
              role="button"
              aria-label={userAriaLabel}
              aria-expanded={isActionsOpen}
            >
              <Styled.UserNameMain>
                <TooltipContainer title={user.name}>
                  <span>
                    {user.name}
                    &nbsp;
                  </span>
                </TooltipContainer>
                <i>{(isMe(user.userId)) ? `(${intl.formatMessage(messages.you)})` : ''}</i>
              </Styled.UserNameMain>
              {
                userNameSub.length
                  ? (
                    <Styled.UserNameSub
                      aria-hidden
                      data-test={user.mobile ? 'mobileUser' : undefined}
                    >
                      {userNameSub.reduce((prev, curr) => [prev, ' | ', curr])}
                    </Styled.UserNameSub>
                  )
                  : null
              }
            </Styled.UserName>
          )
          : null}
      </Styled.UserItemInnerContents>
    );

    const contents = !actions.length
      ? (
        <Styled.NoActionsListItem
          data-test={isMe(user.userId) ? 'userListItemCurrent' : 'userListItem'}
          style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        >
          {innerContents}
        </Styled.NoActionsListItem>
      )
      : (
        <div
          data-test={isMe(user.userId) ? 'userListItemCurrent' : 'userListItem'}
          style={{ direction: isRTL ? 'rtl' : 'ltr', width: '100%' }}
        >
          {innerContents}
        </div>
      );

    if (!actions.length) return contents;

    return (
      <BBBMenu
        trigger={
          (
            <Styled.UserItemContents
              isActionsOpen={isActionsOpen}
              selected={selected === true}
              tabIndex={-1}
              onClick={() => this.setState({ selected: true }, () => Session.set('dropdownOpenUserId', user.userId))}
              onKeyPress={() => { }}
              role="button"
            >
              {contents}
            </Styled.UserItemContents>
          )
        }
        actions={actions}
        selectedEmoji={user.emoji}
        onCloseCallback={() => this.setState({ selected: false }, () => Session.set('dropdownOpenUserId', null))}
        open={selectedUserId === user.userId}
      />
    );
  }
}

UserListItem.propTypes = propTypes;

export default withModalMounter(lockContextContainer(injectIntl(UserListItem)));

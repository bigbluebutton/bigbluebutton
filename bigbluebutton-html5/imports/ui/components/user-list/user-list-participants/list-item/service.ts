import Auth from '/imports/ui/services/auth';
import { MutationFunction } from '@apollo/client';
import { IntlShape, defineMessages } from 'react-intl';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { User } from '/imports/ui/Types/user';
import {
  LockSettings,
  UsersPolicies,
} from '/imports/ui/Types/meeting';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { toggleMuteMicrophone } from '/imports/ui/components/audio/audio-graphql/audio-controls/input-stream-live-selector/service';
import { DispatcherFunction } from '/imports/ui/components/layout/layoutTypes';
import { UserActionPermissions } from './types';
import logger from '/imports/startup/client/logger';
import { setPendingChat } from '/imports/ui/core/local-states/usePendingChat';

const intlMessages = defineMessages({
  presenter: {
    id: 'app.userList.presenter',
    description: 'Text for identifying presenter user',
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
  locked: {
    id: 'app.userList.locked',
    description: 'Text for identifying locked user',
  },
  breakoutRoom: {
    id: 'app.createBreakoutRoom.room',
    description: 'breakout room',
  },
  startPrivateChat: {
    id: 'app.userList.menu.chat.label',
    description: 'label for option to start a new private chat',
  },
  muteUserAudioLabel: {
    id: 'app.userList.menu.muteUserAudio.label',
    description: 'Forcefully mute this user',
  },
  unmuteUserAudioLabel: {
    id: 'app.userList.menu.unmuteUserAudio.label',
    description: 'Forcefully unmute this user',
  },
  microphoneOpen: {
    id: 'app.userList.menu.microphoneOpen',
    description: 'Tooltip for when a user microphone is open',
  },
  microphoneClosed: {
    id: 'app.userList.menu.microphoneClosed',
    description: 'Tooltip for when a user microphone is closed',
  },
  listenOnly: {
    id: 'app.userList.menu.listenOnly',
    description: 'Text for identifying listen only user',
  },
  removeWhiteboardAccess: {
    id: 'app.userList.menu.removeWhiteboardAccess.label',
    description: 'label to remove user whiteboard access',
  },
  giveWhiteboardAccess: {
    id: 'app.userList.menu.giveWhiteboardAccess.label',
    description: 'label to give user whiteboard access',
  },
  multiUserLimitHasBeenReachedNotification: {
    id: 'app.whiteboard.toolbar.multiUserLimitHasBeenReachedNotification',
    description: 'message for when the maximum number of whiteboard writers has been reached',
  },
  takePresenterLabel: {
    id: 'app.actionsBar.actionsDropdown.takePresenter',
    description: 'Set this user to be the presenter in this meeting',
  },
  makePresenterLabel: {
    id: 'app.userList.menu.makePresenter.label',
    description: 'label to make another user presenter',
  },
  promoteUserLabel: {
    id: 'app.userList.menu.promoteUser.label',
    description: 'Forcefully promote this viewer to a moderator',
  },
  demoteUserLabel: {
    id: 'app.userList.menu.demoteUser.label',
    description: 'Forcefully demote this moderator to a viewer',
  },
  unlockUserLabel: {
    id: 'app.userList.menu.unlockUser.label',
    description: 'Unlock individual user',
  },
  lockUserLabel: {
    id: 'app.userList.menu.lockUser.label',
    description: 'Lock a unlocked user',
  },
  lockPublicChat: {
    id: 'app.userList.menu.lockPublicChat.label',
    description: 'label for option to lock user\'s public chat',
  },
  unlockPublicChat: {
    id: 'app.userList.menu.unlockPublicChat.label',
    description: 'label for option to lock user\'s public chat',
  },
  directoryLookupLabel: {
    id: 'app.userList.menu.directoryLookup.label',
    description: 'Directory lookup',
  },
  removeUserLabel: {
    id: 'app.userList.menu.removeUser.label',
    description: 'Forcefully remove this user from the meeting',
  },
  ejectUserCamerasLabel: {
    id: 'app.userList.menu.ejectUserCameras.label',
    description: 'label to eject user cameras',
  },
  lowerUserHand: {
    id: 'app.statusNotifier.lowerHandDescOneUser',
    description: 'Label for lowering a user raised hand',
  },
});
export const isVoiceOnlyUser = (userId: string) => userId.toString().startsWith('v_');

export const isMe = (userId: string) => userId === Auth.userID;

export const generateActionsPermissions = (
  subjectUser: User,
  currentUserIsPresenter: boolean,
  currentUserIsModerator: boolean,
  currentUserLocked: boolean,
  lockSettings: LockSettings,
  usersPolicies: UsersPolicies,
  isBreakout: boolean,
  isMuted: boolean,
  isChatEnabled: boolean,
  isPrivateChatEnabled: boolean,
  type: string,
) => {
  const subjectUserVoice = subjectUser.voice;
  const subjectUserInAudio = subjectUserVoice?.joined && !subjectUserVoice?.deafened;
  const amIModerator = currentUserIsModerator;
  const isDialInUser = isVoiceOnlyUser(subjectUser.userId);
  const amISubjectUser = isMe(subjectUser.userId);
  const isSubjectUserModerator = subjectUser.isModerator;
  const isSubjectUserGuest = subjectUser.guest;
  const isSubjectUserBot = subjectUser.bot;
  // Breakout rooms mess up with role permissions
  // A breakout room user that has a moderator role in it's parent room
  const parentRoomModerator = getFromUserSettings('bbb_parent_room_moderator', false);
  const hasAuthority = currentUserIsModerator || amISubjectUser;

  const userChatIsLocked = currentUserLocked && lockSettings?.disablePrivateChat;
  const preventSelfChat = !amISubjectUser;
  const moderatorOverride = currentUserIsModerator
    && !amISubjectUser && !isDialInUser && isPrivateChatEnabled;
  const regularUserCondition = (isPrivateChatEnabled
    && isChatEnabled
    && !lockSettings?.disablePrivateChat
    && !isDialInUser)
    || currentUserIsModerator;
  const allowedToChatPrivately = preventSelfChat
    && (moderatorOverride || regularUserCondition || !userChatIsLocked)
    && type === 'participant';

  const allowedToMuteAudio = hasAuthority
    && subjectUserInAudio
    && !isMuted
    && !subjectUserVoice?.listenOnly
    && !isSubjectUserBot
    && !isBreakout
    && (type === 'participant' || type === 'raised-hand');

  const allowedToUnmuteAudio = hasAuthority
    && subjectUserInAudio
    && !subjectUserVoice?.listenOnly
    && isMuted
    && (amISubjectUser || usersPolicies?.allowModsToUnmuteUsers)
    && !lockSettings?.disableMic
    && !isBreakout
    && (type === 'participant' || type === 'raised-hand');

  const allowedToChangeWhiteboardAccess = currentUserIsPresenter
      && !amISubjectUser && !subjectUser.presenter
      && !isSubjectUserBot
      && !isDialInUser
      && !isBreakout
      && (type === 'participant' || type === 'raised-hand');

  const allowedToSetPresenter = (amIModerator || isBreakout)
      && !subjectUser.presenter
      && !isSubjectUserBot
      && !isDialInUser
      && (type === 'participant' || type === 'raised-hand');

  // if currentUser is a moderator, allow removing other users
  const allowedToRemove = amIModerator
    && !amISubjectUser
    && (!isBreakout || parentRoomModerator)
    && (type === 'participant' || type === 'raised-hand');

  const allowedToPromote = amIModerator
    && !amISubjectUser
    && !isSubjectUserModerator
    && !isDialInUser
    && !isBreakout
    && !isSubjectUserBot
    && !(isSubjectUserGuest && usersPolicies?.authenticatedGuest && !usersPolicies?.allowPromoteGuestToModerator)
    && (type === 'participant' || type === 'raised-hand');

  const allowedToDemote = amIModerator
    && !amISubjectUser
    && isSubjectUserModerator
    && !isDialInUser
    && !isBreakout
    && !isSubjectUserBot
    && !(isSubjectUserGuest && usersPolicies?.authenticatedGuest && !usersPolicies?.allowPromoteGuestToModerator)
    && (type === 'participant' || type === 'raised-hand');

  const allowedToChangeUserLockStatus = amIModerator
    && !isSubjectUserModerator
    && !isSubjectUserBot
    && lockSettings?.hasActiveLockSetting
    && (type === 'participant' || type === 'raised-hand');

  const allowedToEjectCameras = amIModerator
    && !amISubjectUser
    && usersPolicies?.allowModsToEjectCameras
    && subjectUser.cameras.length > 0
    && (type === 'participant' || type === 'raised-hand');

  const allowedToLowerHand = subjectUser.raiseHand
    && (amIModerator
    || amISubjectUser)
    && type === 'raised-hand';

  return {
    allowedToChatPrivately,
    allowedToMuteAudio,
    allowedToUnmuteAudio,
    allowedToChangeWhiteboardAccess,
    allowedToSetPresenter,
    allowedToPromote,
    allowedToDemote,
    allowedToChangeUserLockStatus,
    allowedToEjectCameras,
    allowedToRemove,
    allowedToLowerHand,
  };
};

export const startPrivateChatOnClick = (
  layoutContextDispatch: DispatcherFunction,
  chatCreateWithUser: MutationFunction,
  user: Partial<User>,
) => {
  chatCreateWithUser({
    variables: {
      userId: user.userId,
    },
  });
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
    value: '',
  });
};

export const hasWhiteboardWriteAccess = (user: Partial<User>) => (user?.whiteboardWriteAccess === true);

export const handleWhiteboardAccessChange = async (
  user: Partial<User>,
  pageId: string,
  userSetWhiteboardWriteAccess: MutationFunction,
  newWhiteboardWriteAccess: boolean,
) => {
  // There is no presentation available, so access cannot be granted.
  if (!pageId) return;
  try {
    // Determine if the user has access
    const { userId, whiteboardWriteAccess } = user;

    if (newWhiteboardWriteAccess !== whiteboardWriteAccess) {
      // Update user whiteboardWriteAccess
      await userSetWhiteboardWriteAccess({
        variables: {
          userIds: [userId],
          allUsers: false,
          whiteboardWriteAccess: newWhiteboardWriteAccess,
        },
      });
    }
  } catch (error) {
    logger.warn({
      logCode: 'user_action_whiteboard_access_failed',
    }, 'Error updating whiteboard access.');
  }
};

export const toggleVoice = (
  userId: string,
  muted: boolean,
  voiceToggle: (userId: string, muted: boolean) => void,
) => {
  if (isMe(userId)) {
    toggleMuteMicrophone(!muted, voiceToggle);
  } else {
    voiceToggle(userId, muted);
    logger.info({
      logCode: 'usermenu_option_mute_toggle_audio',
      extraInfo: { logType: 'moderator_action', userId },
    }, 'moderator muted user microphone');
  }
};

export const createToolbarOptions = (
  intl: IntlShape,
  user: User,
  isMuted: boolean,
  whiteboardAccess: boolean,
  actionsPermitions: UserActionPermissions,
  lockSettings: LockSettings,
  pageId: string,
  layoutContextDispatch: DispatcherFunction,
  chatCreateWithUser: MutationFunction,
  toggleVoice: (userId: string, muted: boolean) => Promise<void>,
  userSetWhiteboardWriteAccess: MutationFunction,
  setPresenter: MutationFunction,
  setRole: MutationFunction,
  setLocked: MutationFunction,
  userEjectCameras: MutationFunction,
  openConfirmationModal: () => void,
  setRaiseHand: MutationFunction,
) => {
  const MODERATOR_ROLE = window.meetingClientSettings.public.user.role_moderator;
  const VIEWER_ROLE = window.meetingClientSettings.public.user.role_viewer;
  const {
    allowedToChatPrivately,
    allowedToMuteAudio,
    allowedToUnmuteAudio,
    allowedToChangeWhiteboardAccess,
    allowedToSetPresenter,
    allowedToPromote,
    allowedToDemote,
    allowedToChangeUserLockStatus,
    allowedToEjectCameras,
    allowedToRemove,
    allowedToLowerHand,
  } = actionsPermitions;

  const subjectUserInAudio = user.voice?.joined && !user.voice?.deafened;
  const userLocked = user.locked
    && lockSettings?.hasActiveLockSetting
    && !user.isModerator;

  const getAudioStateOption = () => {
    if (!subjectUserInAudio) return null;

    const isListenOnly = user.voice?.listenOnly || user.voice?.listenOnlyInputDevice;

    if (isListenOnly) {
      return {
        key: 'audio',
        label: intl.formatMessage(intlMessages.listenOnly),
        icon: 'listen',
        onClick: () => {},
        disabled: true,
        dataTest: 'listenOnly',
      };
    }

    const hasPermissionToUnmute = allowedToUnmuteAudio;
    const hasPermissionToMute = allowedToMuteAudio;

    if (isMuted) {
      return {
        key: 'audio',
        icon: 'mute',
        label: hasPermissionToUnmute
          ? intl.formatMessage(intlMessages.unmuteUserAudioLabel)
          : intl.formatMessage(intlMessages.microphoneClosed),
        onClick: hasPermissionToUnmute
          ? () => toggleVoice(user.userId, false)
          : () => {},
        disabled: !hasPermissionToUnmute,
        dataTest: hasPermissionToUnmute ? 'unmuteUser' : 'audioStateMuted ',
      };
    }

    return {
      key: 'audio',
      icon: 'unmute',
      label: hasPermissionToMute
        ? intl.formatMessage(intlMessages.muteUserAudioLabel)
        : intl.formatMessage(intlMessages.microphoneOpen),
      onClick: hasPermissionToMute
        ? () => toggleVoice(user.userId, true)
        : () => {},
      disabled: !hasPermissionToMute,
      dataTest: hasPermissionToMute ? 'muteUser' : 'audioStateUnmuted',
    };
  };
  const audioStateOption = getAudioStateOption();

  return {
    pinnedToolbarOptions: [
      {
        allowed: allowedToLowerHand,
        key: 'lowerHand',
        label: intl.formatMessage(intlMessages.lowerUserHand),
        onClick: () => {
          setRaiseHand({
            variables: {
              userId: user.userId,
              raiseHand: false,
            },
          });
        },
        dataTest: 'lowerHand',
      },
      {
        allowed: allowedToChatPrivately,
        key: 'privateChat',
        label: intl.formatMessage(intlMessages.startPrivateChat),
        onClick: () => {
          setPendingChat(user.userId);
          startPrivateChatOnClick(layoutContextDispatch, chatCreateWithUser, user);
        },
        icon: 'group_chat',
        dataTest: 'startPrivateChat',
      },
      ...(audioStateOption ? [{ ...audioStateOption, allowed: true }] : []),
      {
        allowed: allowedToChangeWhiteboardAccess && !!pageId,
        key: 'changeWhiteboardAccess',
        label: whiteboardAccess
          ? intl.formatMessage(intlMessages.removeWhiteboardAccess)
          : intl.formatMessage(intlMessages.giveWhiteboardAccess),
        onClick: () => {
          handleWhiteboardAccessChange(user, pageId, userSetWhiteboardWriteAccess, !whiteboardAccess);
        },
        icon: whiteboardAccess ? 'pen_tool' : 'pen_tool_off',
        dataTest: 'changeWhiteboardAccessUser',
      },
    ],
    otherToolbarOptions: [
      {
        allowed: allowedToSetPresenter,
        key: 'setPresenter',
        label: isMe(user.userId)
          ? intl.formatMessage(intlMessages.takePresenterLabel)
          : intl.formatMessage(intlMessages.makePresenterLabel),
        onClick: () => {
          setPresenter({
            variables: {
              userId: user.userId,
            },
          });
        },
        icon: 'presentation',
        dataTest: isMe(user.userId) ? 'takePresenter' : 'makePresenter',
      },
      {
        allowed: allowedToPromote,
        key: 'promote',
        label: intl.formatMessage(intlMessages.promoteUserLabel),
        onClick: () => {
          setRole({
            variables: {
              userId: user.userId,
              role: MODERATOR_ROLE,
            },
          });
        },
        icon: 'promote',
        dataTest: 'promoteToModerator',
      },
      {
        allowed: allowedToDemote,
        key: 'demote',
        label: intl.formatMessage(intlMessages.demoteUserLabel),
        onClick: () => {
          setRole({
            variables: {
              userId: user.userId,
              role: VIEWER_ROLE,
            },
          });
        },
        icon: 'user',
        dataTest: 'demoteToViewer',
      },
      {
        allowed: allowedToChangeUserLockStatus,
        key: 'unlockUser',
        label: userLocked ? intl.formatMessage(intlMessages.unlockUserLabel, { userName: user.name })
          : intl.formatMessage(intlMessages.lockUserLabel, { userName: user.name }),
        onClick: () => {
          setLocked({
            variables: {
              userId: user.userId,
              locked: !userLocked,
            },
          });
        },
        icon: userLocked ? 'unlock' : 'lock',
        dataTest: 'unlockUserButton',
      },
      {
        allowed: allowedToEjectCameras,
        key: 'ejectUserCameras',
        label: intl.formatMessage(intlMessages.ejectUserCamerasLabel),
        onClick: () => {
          userEjectCameras({
            variables: {
              userId: user.userId,
            },
          });
        },
        icon: 'video_off',
        dataTest: 'ejectCamera',
      },
      {
        allowed: allowedToRemove,
        key: 'remove',
        label: intl.formatMessage(intlMessages.removeUserLabel, { userName: user.name }),
        onClick: () => {
          openConfirmationModal();
        },
        icon: 'circle_close',
        dataTest: 'removeUser',
      },
    ],
  };
};

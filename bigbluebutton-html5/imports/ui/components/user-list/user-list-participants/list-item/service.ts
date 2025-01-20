import Auth from '/imports/ui/services/auth';
import { LazyQueryExecFunction, MutationFunction } from '@apollo/client';
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
import {
  GetWritersData,
  GetWritersVariables,
  UserActionPermissions,
  Writer,
} from './types';
import logger from '/imports/startup/client/logger';
import { setPendingChat } from '/imports/ui/core/local-states/usePendingChat';
import { notify } from '/imports/ui/services/notification';

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
  you: {
    id: 'app.userList.you',
    description: 'Text for identifying your user',
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
});
export const isVoiceOnlyUser = (userId: string) => userId.toString().startsWith('v_');

export const isMe = (userId: string) => userId === Auth.userID;

export const generateActionsPermissions = (
  subjectUser: User,
  currentUser: User,
  lockSettings: LockSettings,
  usersPolicies: UsersPolicies,
  isBreakout: boolean,
  isMuted: boolean,
  isChatEnabled: boolean,
  isPrivateChatEnabled: boolean,
) => {
  const subjectUserVoice = subjectUser.voice;

  const amIModerator = currentUser.isModerator;
  const isDialInUser = isVoiceOnlyUser(subjectUser.userId);
  const amISubjectUser = isMe(subjectUser.userId);
  const isSubjectUserModerator = subjectUser.isModerator;
  const isSubjectUserGuest = subjectUser.guest;
  // Breakout rooms mess up with role permissions
  // A breakout room user that has a moderator role in it's parent room
  const parentRoomModerator = getFromUserSettings('bbb_parent_room_moderator', false);
  const hasAuthority = currentUser.isModerator || amISubjectUser;
  const userChatIsLocked = currentUser.locked || lockSettings?.disablePrivateChat;
  const allowedToChatPrivately = isChatEnabled && (
    currentUser.isModerator || (
      !userChatIsLocked
        // TODO: Add check for hasPrivateChat between users
        || subjectUser.isModerator
    )) && !amISubjectUser
    && !isDialInUser
    && isPrivateChatEnabled
    && !isBreakout;

  const allowedToMuteAudio = hasAuthority
    && subjectUserVoice?.joined
    && !isMuted
    && !subjectUserVoice?.listenOnly
    && !isBreakout;

  const allowedToUnmuteAudio = hasAuthority
    && subjectUserVoice?.joined
    && !subjectUserVoice.listenOnly
    && isMuted
    && (amISubjectUser || usersPolicies?.allowModsToUnmuteUsers)
    && !lockSettings?.disableMic
    && !isBreakout;

  const allowedToChangeWhiteboardAccess = currentUser.presenter
      && !amISubjectUser && !subjectUser.presenter
      && !isDialInUser;

  const allowedToSetPresenter = amIModerator
      && !subjectUser.presenter
      && !isDialInUser;

  // if currentUser is a moderator, allow removing other users
  const allowedToRemove = amIModerator
    && !amISubjectUser
    && (!isBreakout || parentRoomModerator);

  const allowedToPromote = amIModerator
    && !amISubjectUser
    && !isSubjectUserModerator
    && !isDialInUser
    && !isBreakout
    && !(isSubjectUserGuest && usersPolicies?.authenticatedGuest && !usersPolicies?.allowPromoteGuestToModerator);

  const allowedToDemote = amIModerator
    && !amISubjectUser
    && isSubjectUserModerator
    && !isDialInUser
    && !isBreakout
    && !(isSubjectUserGuest && usersPolicies?.authenticatedGuest && !usersPolicies?.allowPromoteGuestToModerator);

  const allowedToChangeUserLockStatus = amIModerator
    && !isSubjectUserModerator
    && lockSettings?.hasActiveLockSetting;

  const allowedToEjectCameras = amIModerator
    && !amISubjectUser
    && usersPolicies?.allowModsToEjectCameras
    && subjectUser.cameras.length > 0;

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

export const hasWhiteboardAccess = (user: Partial<User>) => {
  const { userId, presPagesWritable = [] } = user;
  return presPagesWritable.some((page) => page?.userId === userId && page?.isCurrentPage);
};

export const handleWhiteboardAccessChange = async (
  intl: IntlShape,
  user: Partial<User>,
  pageId: string,
  getWriters: LazyQueryExecFunction<GetWritersData, GetWritersVariables>,
  presentationSetWriters: MutationFunction,
) => {
  try {
    // Fetch the writers data
    const { data } = await getWriters();
    const allWriters: Writer[] = data?.pres_page_writers || [];
    const currentWriters = allWriters?.filter((writer: Writer) => writer.pageId === pageId);

    // Determine if the user has access
    const { userId } = user;
    if (!userId) throw new Error('Invalid userId');
    const hasAccess = hasWhiteboardAccess(user);

    // Prepare the updated list of user IDs for whiteboard access
    const usersIds = currentWriters?.map((writer: { userId: string }) => writer?.userId);
    const newUsersIds: string[] = hasAccess
      ? usersIds.filter((id: string) => id !== userId)
      : [...usersIds, userId];

    // Check if the maximum number of writers has been reached.
    // If so, notify the user then return.
    const WHITEBOARD_CONFIG = window.meetingClientSettings.public.whiteboard;
    if (newUsersIds.length >= WHITEBOARD_CONFIG.maxNumberOfActiveUsers) {
      notify(
        intl.formatMessage(
          intlMessages.multiUserLimitHasBeenReachedNotification,
          { 0: WHITEBOARD_CONFIG.maxNumberOfActiveUsers },
        ),
        'info',
        'pen_tool',
      );
      return;
    }
    // Update the writers
    await presentationSetWriters({
      variables: {
        pageId,
        usersIds: newUsersIds,
      },
    });
  } catch (error) {
    logger.warn({
      logCode: 'user_action_whiteboard_access_failed',
    }, 'Error updating whiteboard access.');
  }
};

export const toggleVoice = (userId: string, muted: boolean, voiceToggle: (userId: string, muted: boolean) => void) => {
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
  whiteboardAccess: boolean,
  actionsPermitions: UserActionPermissions,
  lockSettings: LockSettings,
  pageId: string,
  layoutContextDispatch: DispatcherFunction,
  chatCreateWithUser: MutationFunction,
  toggleVoice: (userId: string, muted: boolean) => Promise<void>,
  getWriters: LazyQueryExecFunction<GetWritersData, GetWritersVariables>,
  presentationSetWriters: MutationFunction,
  setPresenter: MutationFunction,
  setRole: MutationFunction,
  setLocked: MutationFunction,
  userEjectCameras: MutationFunction,
  setIsConfirmationModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
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
  } = actionsPermitions;

  const userLocked = user.locked
    && lockSettings?.hasActiveLockSetting
    && !user.isModerator;

  return {
    pinnedToolbarOptions: [
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
      {
        allowed: allowedToMuteAudio,
        key: 'mute',
        label: intl.formatMessage(intlMessages.muteUserAudioLabel),
        onClick: () => {
          toggleVoice(user.userId, true);
        },
        icon: 'unmute',
        dataTest: 'muteUser',
      },
      {
        allowed: allowedToUnmuteAudio,
        key: 'unmute',
        label: intl.formatMessage(intlMessages.unmuteUserAudioLabel),
        onClick: () => {
          toggleVoice(user.userId, false);
        },
        icon: 'mute',
        dataTest: 'unmuteUser',
      },
      {
        allowed: allowedToChangeWhiteboardAccess,
        key: 'changeWhiteboardAccess',
        label: whiteboardAccess
          ? intl.formatMessage(intlMessages.removeWhiteboardAccess)
          : intl.formatMessage(intlMessages.giveWhiteboardAccess),
        onClick: () => {
          handleWhiteboardAccessChange(intl, user, pageId, getWriters, presentationSetWriters);
        },
        icon: 'pen_tool',
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
        label: userLocked ? intl.formatMessage(intlMessages.unlockUserLabel, { 0: user.name })
          : intl.formatMessage(intlMessages.lockUserLabel, { 0: user.name }),
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
        label: intl.formatMessage(intlMessages.removeUserLabel, { 0: user.name }),
        onClick: () => {
          setIsConfirmationModalOpen(true);
        },
        icon: 'circle_close',
        dataTest: 'removeUser',
      },
    ],
  };
};

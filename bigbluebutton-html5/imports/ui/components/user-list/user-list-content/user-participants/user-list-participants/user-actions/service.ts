import { User } from '/imports/ui/Types/user';
import {
  LockSettings,
  UsersPolicies,
} from '/imports/ui/Types/meeting';
import Auth from '/imports/ui/services/auth';
import logger from '/imports/startup/client/logger';
import { toggleMuteMicrophone } from '/imports/ui/components/audio/audio-graphql/audio-controls/input-stream-live-selector/service';
import { useIsPrivateChatEnabled } from '/imports/ui/services/features';
import getFromUserSettings from '/imports/ui/services/users-settings';

export const isVoiceOnlyUser = (userId: string) => typeof userId === 'string' && userId.startsWith('v_');

export const isMe = (userId: string) => userId === Auth.userID;

export const generateActionsPermissions = (
  subjectUser: User,
  currentUser: User,
  lockSettings: LockSettings,
  usersPolicies: UsersPolicies,
  isBreakout: boolean,
  isMuted: boolean,
) => {
  const subjectUserVoice = subjectUser.voice;
  const subjectUserInAudio = subjectUserVoice?.joined && !subjectUserVoice?.deafened;
  const amIModerator = currentUser.isModerator;
  const isDialInUser = isVoiceOnlyUser(subjectUser.userId);
  const amISubjectUser = isMe(subjectUser.userId);
  const isSubjectUserModerator = subjectUser.isModerator;
  // Breakout rooms mess up with role permissions
  // A breakout room user that has a moderator role in it's parent room
  const parentRoomModerator = getFromUserSettings('bbb_parent_room_moderator', false);
  const isSubjectUserGuest = subjectUser.guest;
  const hasAuthority = currentUser.isModerator || amISubjectUser;
  const allowedToChatPrivately = !amISubjectUser && !isDialInUser && useIsPrivateChatEnabled();
  const allowedToMuteAudio = hasAuthority
    && subjectUserInAudio
    && !isMuted
    && !subjectUserVoice?.listenOnly;

  const allowedToUnmuteAudio = hasAuthority
    && subjectUserInAudio
    && !subjectUserVoice?.listenOnly
    && isMuted
    && (amISubjectUser || usersPolicies?.allowModsToUnmuteUsers);

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

  const allowedToChangeWhiteboardAccess = currentUser.presenter
    && !amISubjectUser;

  const allowedToEjectCameras = amIModerator
    && !amISubjectUser
    && usersPolicies?.allowModsToEjectCameras;

  const allowedToSetPresenter = amIModerator
    && !subjectUser.presenter
    && !isDialInUser;

  return {
    allowedToChatPrivately,
    allowedToMuteAudio,
    allowedToUnmuteAudio,
    allowedToRemove,
    allowedToSetPresenter,
    allowedToPromote,
    allowedToDemote,
    allowedToChangeUserLockStatus,
    allowedToChangeWhiteboardAccess,
    allowedToEjectCameras,
  };
};

export const isVideoPinEnabledForCurrentUser = (
  currentUser: User,
  isBreakout: boolean,
) => {
  const { isModerator } = currentUser;

  const PIN_WEBCAM = window.meetingClientSettings.public.kurento.enableVideoPin;
  const isPinEnabled = PIN_WEBCAM;

  return !!(isModerator
    && isPinEnabled
    && !isBreakout);
};

// actions
// disclaimer: For the first version of the userlist using graphql
// we decide keep using the same actions as the old userlist
// so this code is duplicated from the old userlist service
// session for chats the current user started

export const toggleVoice = (
  userId: string,
  muted: boolean,
  voiceToggle: (userId: string, muted: boolean) => void,
  isBreakout: boolean,
  parentId: string,
) => {
  if (userId === Auth.userID) {
    toggleMuteMicrophone(!muted, voiceToggle, isBreakout, parentId);
  } else {
    voiceToggle(userId, muted);
    logger.info({
      logCode: 'usermenu_option_mute_toggle_audio',
      extraInfo: { logType: 'moderator_action', userId },
    }, 'moderator muted user microphone');
  }
};

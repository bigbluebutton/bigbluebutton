
import { User } from '/imports/ui/Types/user';
import {LockSettings, UsersPolicies} from '/imports/ui/Types/meeting';
import Auth from '/imports/ui/services/auth';
import { EMOJI_STATUSES } from '/imports/utils/statuses';


export const isVoiceOnlyUser = (userId:string) => userId.toString().startsWith('v_');

export const isMe = (userId: string) => userId === Auth.userID;

export const generateActionsPermissions = (
  subjectUser: User,
  currentUser: User,
  lockSettings: LockSettings,
  usersPolicies: UsersPolicies,
  isBreakout: boolean,
  ) => {

  const subjectUserVoice = subjectUser.voice;

  const amIModerator = currentUser.isModerator;
  const isDialInUser = isVoiceOnlyUser(subjectUser.userId);
  const amISubjectUser = isMe(subjectUser.userId);
  const isSubjectUserModerator = subjectUser.isModerator;
  const isSubjectUserGuest = subjectUser.guest;
  const hasAuthority = currentUser.isModerator || amISubjectUser;
  const allowedToChatPrivately = !amISubjectUser && !isDialInUser;
  
  const allowedToMuteAudio = hasAuthority
    && subjectUserVoice?.joined
    && !subjectUserVoice?.muted
    && !subjectUserVoice?.listenOnly;

    const allowedToUnmuteAudio = hasAuthority
    && subjectUserVoice?.joined
    && !subjectUserVoice.listenOnly
    && subjectUserVoice.muted
    && (amISubjectUser || usersPolicies.allowModsToUnmuteUsers);  

    const allowedToResetStatus = hasAuthority
    && subjectUser.emoji !== EMOJI_STATUSES.none
    && !isDialInUser;

    // if currentUser is a moderator, allow removing other users
    const allowedToRemove = amIModerator
    && !amISubjectUser
    && !isBreakout;

    const allowedToPromote = amIModerator
    && !amISubjectUser
    && !isSubjectUserModerator
    && !isDialInUser
    && !isBreakout
    && !(isSubjectUserGuest && usersPolicies.authenticatedGuest);

    const allowedToDemote = amIModerator
    && !amISubjectUser
    && isSubjectUserModerator
    && !isDialInUser
    && !isBreakout
    && !(isSubjectUserGuest && usersPolicies.authenticatedGuest);

    const allowedToChangeStatus = amISubjectUser;

    const allowedToChangeUserLockStatus = amIModerator
    && !isSubjectUserModerator
    && lockSettings.hasActiveLockSetting;

    const allowedToChangeWhiteboardAccess = currentUser.presenter
    && !amISubjectUser;

    const allowedToEjectCameras = amIModerator
    && !amISubjectUser
    && usersPolicies.allowModsToEjectCameras;

    const allowedToSetPresenter = amIModerator
    && !subjectUser.presenter
    && !isDialInUser;

    return {
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
    };
};
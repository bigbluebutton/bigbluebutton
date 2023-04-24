
import { User } from '/imports/ui/Types/user';
import { Meeting } from '/imports/ui/Types/meeting';
import {LockSettings, UsersPolicies} from '/imports/ui/Types/meeting';
import Auth from '/imports/ui/services/auth';
import { EMOJI_STATUSES } from '/imports/utils/statuses';
import { makeCall } from '/imports/ui/services/api';
import GroupChat from '/imports/api/group-chat';
import { indexOf, without } from '/imports/utils/array-utils';
import AudioService from '/imports/ui/components/audio/service';
import logger from '/imports/startup/client/logger';
import { Session } from 'meteor/session';
import WhiteboardService from '/imports/ui/components/whiteboard/service';
import { throttle } from 'radash';

const PIN_WEBCAM = Meteor.settings.public.kurento.enableVideoPin;

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
    const allowUserLookup = Meteor.settings.public.app.allowUserLookup;
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
      allowUserLookup,
    };
};

export const isVideoPinEnabledForCurrentUser = (
  currentUser: User,
  isBreakout: boolean,
) => {
  const isModerator = currentUser;
  const isPinEnabled = PIN_WEBCAM;

  return !!(isModerator
    && isPinEnabled
    && !isBreakout);
}


// actions
// disclaimer: For the first version of the userlist using graphql
// we decide keep using the same actions as the old userlist
// so this code is duplicated from the old userlist service
const CLOSED_CHAT_LIST_KEY = 'closedChatList';
// session for chats the current user started
const STARTED_CHAT_LIST_KEY = 'startedChatList';
const hasPrivateChatBetweenUsers = (senderId: string, receiverId: string) => GroupChat
  .findOne({ users: { $all: [receiverId, senderId] } });

export const getGroupChatPrivate = (senderUserId: string, receiver: User) => {
  const chat = hasPrivateChatBetweenUsers(senderUserId, receiver.userId);
  if (!chat) {
    makeCall('createGroupChat', receiver);
  } else {
    const startedChats = Session.get(STARTED_CHAT_LIST_KEY) || [];
    if (indexOf(startedChats, chat.chatId) < 0) {
      startedChats.push(chat.chatId);
      Session.set(STARTED_CHAT_LIST_KEY, startedChats);
    }

    const currentClosedChats = Storage.getItem(CLOSED_CHAT_LIST_KEY);
    if (indexOf(currentClosedChats, chat.chatId) > -1) {
      Storage.setItem(CLOSED_CHAT_LIST_KEY, without(currentClosedChats, chat.chatId));
    }
  }
};

export const setEmojiStatus = throttle({ interval: 1000 }, (userId, emoji) => {
  const statusAvailable = (Object.keys(EMOJI_STATUSES).includes(emoji));
  return statusAvailable
    ? makeCall('setEmojiStatus', Auth.userID, emoji)
    : makeCall('setEmojiStatus', userId, 'none');
});

export const toggleVoice = (userId: string) => {
  if (userId === Auth.userID) {
    AudioService.toggleMuteMicrophone();
  } else {
    makeCall('toggleVoice', userId);
    logger.info({
      logCode: 'usermenu_option_mute_toggle_audio',
      extraInfo: { logType: 'moderator_action', userId },
    }, 'moderator muted user microphone');
  }
};

export const changeWhiteboardAccess = (userId:string, whiteboardAccess:boolean) => {
  WhiteboardService.changeWhiteboardAccess(userId, !whiteboardAccess);
};

export const removeUser = (userId: string, banUser: boolean) => {
  if (isVoiceOnlyUser(userId)) {
    makeCall('ejectUserFromVoice', userId, banUser);
  } else {
    makeCall('removeUser', userId, banUser);
  }
};



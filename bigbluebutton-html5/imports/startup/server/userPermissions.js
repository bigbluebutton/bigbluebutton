import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import { logger } from '/imports/startup/server/logger';

const presenter = {
  switchSlide: true,

  //poll
  subscribePoll: true,
  subscribeAnswers: true,

  // presentation
  removePresentation: true,
  sharePresentation: true,
};

// holds the values for whether the moderator user is allowed to perform an action (true)
// or false if not allowed. Some actions have dynamic values depending on the current lock settings
const moderator = {
  // audio listen only
  joinListenOnly: true,
  leaveListenOnly: true,

  // join audio with mic cannot be controlled on the server side as it is
  // a client side only functionality

  // raising/lowering hand
  raiseOwnHand: true,
  lowerOwnHand: true,

  // muting
  muteSelf: true,
  unmuteSelf: true,
  muteOther: true,
  unmuteOther: true,

  logoutSelf: true,

  //subscribing
  subscribeUsers: true,
  subscribeChat: true,

  //chat
  chatPublic: true,
  chatPrivate: true,

  //poll
  subscribePoll: true,
  subscribeAnswers: false,

  //emojis
  setEmojiStatus: true,
  clearEmojiStatus: true,

  //user control
  kickUser: true,
  setPresenter: true,

  //captions
  subscribeCaptions: true,
};

// holds the values for whether the viewer user is allowed to perform an action (true)
// or false if not allowed. Some actions have dynamic values depending on the current lock settings
const viewer = function (meetingId, userId) {
  let meeting;
  let user;

  return {

    // listen only
    joinListenOnly: true,
    leaveListenOnly: true,

    // join audio with mic cannot be controlled on the server side as it is
    // a client side only functionality

    // raising/lowering hand
    raiseOwnHand: true,
    lowerOwnHand: true,

    // muting
    muteSelf: true,
    unmuteSelf:
      !((meeting = Meetings.findOne({ meetingId })) != null &&
        meeting.roomLockSettings.disableMic) ||
      !((user = Users.findOne({ meetingId, userId })) != null &&
        user.user.locked),

    logoutSelf: true,

    //subscribing
    subscribeUsers: true,
    subscribeChat: true,

    //chat
    chatPublic: !((meeting = Meetings.findOne({ meetingId })) != null &&
      meeting.roomLockSettings.disablePublicChat) ||
      !((user = Users.findOne({ meetingId, userId })) != null &&
      user.user.locked) ||
      (user != null && user.user.presenter),

    chatPrivate: !((meeting = Meetings.findOne({ meetingId })) != null &&
      meeting.roomLockSettings.disablePrivateChat) ||
      !((user = Users.findOne({ meetingId, userId })) != null &&
      user.user.locked) ||
      (user != null && user.user.presenter),

    //poll
    subscribePoll: true,
    subscribeAnswers: false,

    //emojis
    setEmojiStatus: true,
    clearEmojiStatus: true,

    //captions
    subscribeCaptions: true,
  };
};

// carries out the decision making for actions affecting users. For the list of
// actions and the default value - see 'viewer' and 'moderator' in the beginning of the file
export function isAllowedTo(action, credentials) {
  const meetingId = credentials.meetingId;
  const userId = credentials.requesterUserId;
  const authToken = credentials.requesterToken;

  const user = Users.findOne({
    meetingId,
    userId,
  });

  const allowedToInitiateRequest =
    null != user &&
    authToken === user.authToken &&
    user.validated &&
    user.user.connection_status === 'online' &&
    'HTML5' === user.clientType &&
    null != user.user;

  if (allowedToInitiateRequest) {
    let result = false;

    // check role specific actions
    if ('MODERATOR' === user.user.role) {
      logger.debug('user permissions moderator case');
      result = result || moderator[action];
    } else if ('VIEWER' === user.user.role) {
      logger.debug('user permissions viewer case');
      result = result || viewer(meetingId, userId)[action];
    }

    // check presenter actions
    if (user.user.presenter) {
      logger.debug('user permissions presenter case');
      result = result || presenter[action];
    }

    logger.debug(`attempt from userId=${userId} to perform:${action}, allowed=${result}`);

    return result;
  } else {
    logger.error(`FAILED due to permissions:${action} ${JSON.stringify(credentials)}`);
    return false;
  }

};

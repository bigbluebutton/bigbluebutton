import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import { logger } from '/imports/startup/server/logger';

const presenter = {
  switchSlide: true,

  //poll
  subscribePoll: true,
  subscribeAnswers: true,
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
      !((meeting = Meetings.findOne({ meetingId: meetingId })) != null &&
        meeting.roomLockSettings.disableMic) ||
      !((user = Users.findOne({ meetingId: meetingId, userId: userId })) != null &&
        user.user.locked),

    logoutSelf: true,

    //subscribing
    subscribeUsers: true,
    subscribeChat: true,

    //chat
    chatPublic: !((meeting = Meetings.findOne({ meetingId: meetingId })) != null &&
      meeting.roomLockSettings.disablePublicChat) ||
      !((user = Users.findOne({ meetingId: meetingId, userId: userId })) != null &&
      user.user.locked) ||
      (user != null && user.user.presenter),

    chatPrivate: !((meeting = Meetings.findOne({ meetingId: meetingId })) != null &&
      meeting.roomLockSettings.disablePrivateChat) ||
      !((user = Users.findOne({ meetingId: meetingId, userId: userId })) != null &&
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

  let user;
  let validated;

  user = Users.findOne({
    meetingId: meetingId,
    userId: userId,
  });
  if (user != null) {
    validated = user.validated;
  }

  logger.info(
    `in isAllowedTo: action-${action}, userId=${userId}, ` +
    `authToken=${authToken} validated:${validated}`
  );
  user = Users.findOne({
    meetingId: meetingId,
    userId: userId,
  });

  // logger.info "user=" + JSON.stringify user
  if ((user != null) && authToken === user.authToken) { // check if the user is who he claims to be
    if (user.validated && user.clientType === 'HTML5') {

      // PRESENTER
      // check presenter specific actions or fallback to regular viewer actions
      if (user.user != null && user.user.presenter) {
        logger.info('user permissions presenter case');
        return presenter[action] || viewer(meetingId, userId)[action] || false;

      // VIEWER
      } else if (user.user != null && user.user.role === 'VIEWER') {
        logger.info('user permissions viewer case');
        return viewer(meetingId, userId)[action] || false;

      // MODERATOR
      } else if (user.user != null && user.user.role === 'MODERATOR') {
        logger.info('user permissions moderator case');
        return moderator[action] || false;
      } else {
        logger.warn(`UNSUCCESSFULL ATTEMPT FROM userid=${userId} to perform:${action}`);
        return false;
      }
    } else {
      // user was not validated
      if (action === 'logoutSelf') {
        // on unsuccessful sign-in
        logger.warn(
          'a user was successfully removed from the ' +
          'meeting following an unsuccessful login'
        );
        return true;
      }

      return false;
    }
  } else {
    logger.error(
      `in meetingId=${meetingId} userId=${userId} tried to perform ${action} ` +
      `without permission${'\n..while the authToken was ' +
      (user != null && user.authToken != null ? user.authToken : void 0) +
      "    and the user's object is " + (JSON.stringify(user))}`
    );

    return false;
  }
};

import { clearUsersCollection } from '/imports/api/users/server/modifiers/clearUsersCollection';
import { setUserLockedStatus } from '/imports/api/users/server/modifiers/setUserLockedStatus';
import { markUserOffline } from '/imports/api/users/server/modifiers/markUserOffline';
import { updateVoiceUser } from '/imports/api/users/server/modifiers/updateVoiceUser';
import { addChatToCollection } from '/imports/api/chat/server/modifiers/addChatToCollection';
import { clearChatCollection} from '/imports/api/chat/server/modifiers/clearChatCollection';
import { clearMeetingsCollection} from '/imports/api/meetings/server/modifiers/clearMeetingsCollection';
import { removeMeetingFromCollection } from '/imports/api/meetings/server/modifiers/removeMeetingFromCollection';
import { clearShapesCollection } from '/imports/api/shapes/server/modifiers/clearShapesCollection';
import { clearSlidesCollection } from '/imports/api/slides/server/modifiers/clearSlidesCollection';
import { clearPresentationsCollection } from '/imports/api/presentations/server/modifiers/clearPresentationsCollection';
import { clearPollCollection } from '/imports/api/polls/server/modifiers/clearPollCollection';
import { clearCursorCollection } from '/imports/api/cursor/server/modifiers/clearCursorCollection';

import { logger } from '/imports/startup/server/logger';
import { redisPubSub } from '/imports/startup/server/index';

// TODO move these under api

export function appendMessageHeader(eventName, messageObj) {
  let header;
  header = {
    timestamp: new Date().getTime(),
    name: eventName,
  };
  messageObj.header = header;
  return messageObj;
};

export function clearCollections() {
  console.log('in function clearCollections');
  clearUsersCollection();
  clearChatCollection();
  clearMeetingsCollection();
  clearShapesCollection();
  clearSlidesCollection();
  clearPresentationsCollection();
  clearPollCollection();
  clearCursorCollection();
}

export const indexOf = [].indexOf || function (item) {
    for (let i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1;
  };

export function publish(channel, message) {
  logger.info(`redis outgoing message  ${message.header.name}`, {
    channel: channel,
    message: message,
  });
  if (redisPubSub != null) {
    return redisPubSub.pubClient.publish(channel, JSON.stringify(message), (err, res) => {
      if (err) {
        return logger.info('error', {
          error: err,
        });
      }
    });
  } else {
    return logger.info('ERROR!! redisPubSub was undefined');
  }
};

export const handleVoiceEvent = function (arg) {
  let _voiceUser, meetingId;
  meetingId = arg.payload.meeting_id;
  _voiceUser = payload.user.voiceUser;
  voiceUserObj = {
    web_userid: _voiceUser.web_userid,
    listen_only: arg.payload.listen_only,
    talking: _voiceUser.talking,
    joined: _voiceUser.joined,
    locked: _voiceUser.locked,
    muted: _voiceUser.muted,
  };
  return updateVoiceUser(meetingId, voiceUserObj, arg.callback);
};

export const handleLockEvent = function (arg) {
  let userId, isLocked;
  userId = arg.payload.userid;
  isLocked = arg.payload.locked;
  setUserLockedStatus(meetingId, userId, isLocked);
  return arg.callback();
};

export const handleEndOfMeeting = function (arg) {
  let meetingId;
  meetingId = arg.payload.meeting_id;
  logger.info(`DESTROYING MEETING ${meetingId}`);
  return removeMeetingFromCollection(meetingId, arg.callback);
};

export const handleChatEvent = function (arg) {
  let messageObject, meetingId;
  messageObject = arg.payload.message;
  meetingId = arg.payload.meeting_id;

  // use current_time instead of message.from_time so that the chats from Flash and HTML5 have uniform times
  messageObject.from_time = arg.header.current_time;
  addChatToCollection(meetingId, messageObject);
  return arg.callback();
};

export const handleRemoveUserEvent = function (arg) {
  if (arg.payload.user != null && arg.payload.user.userid != null && arg.payload.meeting_id != null) {
    let userId, meetingId;
    meetingId = arg.payload.meeting_id;
    userId = arg.payload.user.userid;
    return markUserOffline(meetingId, userId, arg.callback);
  } else {
    logger.info('could not perform handleRemoveUserEvent');
    return arg.callback();
  }
};

// translate '\n' newline character and '\r' carriage
// returns to '<br/>' breakline character for Flash
export function translateHTML5ToFlash(message) {
  let result;
  result = message;
  result = result.replace(new RegExp(CARRIAGE_RETURN, 'g'), BREAK_LINE);
  result = result.replace(new RegExp(NEW_LINE, 'g'), BREAK_LINE);
  return result;
};

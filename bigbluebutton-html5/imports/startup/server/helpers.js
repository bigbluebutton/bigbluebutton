import { clearUsersCollection, setUserLockedStatus, markUserOffline, updateVoiceUser } from '/imports/startup/server/collectionManagers/users';
import { clearChatCollection, addChatToCollection } from '/imports/startup/server/collectionManagers/chat';
import { clearMeetingsCollection, removeMeetingFromCollection } from '/imports/startup/server/collectionManagers/meetings';
import { clearShapesCollection } from '/imports/startup/server/collectionManagers/shapes';
import { clearSlidesCollection } from '/imports/startup/server/collectionManagers/slides';
import { clearPresentationsCollection } from '/imports/startup/server/collectionManagers/presentations';
import { clearPollCollection } from '/imports/startup/server/collectionManagers/poll';
import { clearCursorCollection } from '/imports/startup/server/collectionManagers/cursor';

import { logger } from '/imports/startup/server/logger';
import { redisPubSub } from '/imports/startup/server/index';

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


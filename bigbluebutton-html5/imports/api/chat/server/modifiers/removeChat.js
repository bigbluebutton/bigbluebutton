import Chat from '/imports/api/chat';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import { BREAK_LINE } from '/imports/utils/lineEndings.js';

/**
 * Remove from chat a message that match the regex 'message' param.
 * 
 * @param {string} meetingId
 * @param {string} userId 
 * @param {string} message
 */
export default function removeChat(meetingId, userId, message) {
  if (meetingId && userId && message) {
    const modifiers = { meetingId: meetingId, "message.to_userid": userId ,"message.message":{ '$regex': message, '$options': 'i' }};

      return Chat.remove(modifiers
      , Logger.info(`Removing messages that match: (${message}) `));
  }
};

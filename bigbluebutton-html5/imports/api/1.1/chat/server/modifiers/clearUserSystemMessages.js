import Chat from '/imports/api/1.1/chat';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import { BREAK_LINE } from '/imports/utils/lineEndings.js';

/**
 * Remove any system message from the user with userId.
 *
 * @param {string} meetingId
 * @param {string} userId
 */
export default function clearUserSystemMessages(meetingId, userId) {
  check(meetingId, String);
  check(userId, String);

  const CHAT_CONFIG = Meteor.settings.public.chat;

  const selector = {
    meetingId,
    'message.from_userid': CHAT_CONFIG.type_system,
    'message.to_userid': userId,
  };

  return Chat.remove(selector, Logger.info(`Removing system messages from: (${userId})`));
}

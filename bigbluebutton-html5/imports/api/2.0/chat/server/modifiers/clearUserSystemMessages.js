import Chat from '/imports/api/2.0/chat';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

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
    fromUserId: CHAT_CONFIG.type_system,
    toUserId: userId,
  };

  return Chat.remove(selector, Logger.info(`Removing system messages from: (${userId})`));
}

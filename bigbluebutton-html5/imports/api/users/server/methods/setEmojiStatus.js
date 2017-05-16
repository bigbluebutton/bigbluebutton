import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { isAllowedTo } from '/imports/startup/server/userPermissions';

export default function setEmojiStatus(credentials, userId, status) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toBBBApps.users;
  const EVENT_NAME = 'user_emoji_status_message';

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(userId, String);

  if (!isAllowedTo('setEmojiStatus', credentials)) {
    throw new Meteor.Error('not-allowed', `You are not allowed to setEmojiStatus`);
  }

  let payload = {
    emoji_status: status,
    userid: userId,
    meeting_id: meetingId,
  };

  Logger.verbose(`User '${userId}' emoji status updated to '${status}'
    by '${requesterUserId}' from meeting '${meetingId}'`);

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, payload);
};

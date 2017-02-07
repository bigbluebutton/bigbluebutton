import Meteor from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { isAllowedTo } from '/imports/startup/server/userPermissions';

export default function kickUser(credentials, userId) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toBBBApps.users;
  const EVENT_NAME = 'eject_user_from_meeting_request_message';

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(userId, String);

  if (!isAllowedTo('kickUser', credentials)) {
    throw new Meteor.Error('not-allowed', `You are not allowed to kickUser`);
  }

  let payload = {
    userid: userId,
    ejected_by: requesterUserId,
    meeting_id: meetingId,
  };

  Logger.verbose(`User '${userId}' was kicked by '${requesterUserId}' from meeting '${meetingId}'`);

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, payload);
};

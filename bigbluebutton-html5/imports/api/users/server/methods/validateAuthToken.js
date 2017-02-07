import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import Users from '/imports/api/users';

import { createDummyUser } from '/imports/api/users/server/modifiers/createDummyUser';

export default function validateAuthToken(credentials) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toBBBApps.meeting;
  const EVENT_NAME = 'validate_auth_token';

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  const User = Users.findOne({
    meetingId,
    userId: requesterUserId,
  });

  if (!User) {
    createDummyUser(meetingId, requesterUserId, requesterToken);
  }

  let payload = {
    auth_token: requesterToken,
    userid: requesterUserId,
    meeting_id: meetingId,
  };

  const header = {
    reply_to: `${meetingId}/${requesterUserId}`,
  };

  Logger.verbose(`User '${requesterUserId}' is trying to validate auth token for meeting '${meetingId}'`);

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, payload, header);
};

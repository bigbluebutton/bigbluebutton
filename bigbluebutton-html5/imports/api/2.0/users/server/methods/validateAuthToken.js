import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis2x';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/2.0/users';

import createDummyUser2x from '../modifiers/createDummyUser';
import setConnectionStatus from '../modifiers/setConnectionStatus';

const ONLINE_CONNECTION_STATUS = 'online';

export default function validateAuthToken(credentials) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ValidateAuthTokenReqMsg';

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  const User = Users.findOne({
    meetingId,
    userId: requesterUserId,
  });

  if (!User) {
    createDummyUser2x(meetingId, requesterUserId, requesterToken);
  } else if (User.validated) {
    setConnectionStatus(meetingId, requesterUserId, ONLINE_CONNECTION_STATUS);
  }

  const payload = {
    userId: requesterUserId,
    authToken: requesterToken,
  };

  const header = {
    name: EVENT_NAME,
    meetingId,
    userId: requesterUserId,
  };

  Logger.info(`User '${
    requesterUserId
    }' is trying to validate auth tokenfor meeting '${meetingId}'`);

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, meetingId, payload, header);
}

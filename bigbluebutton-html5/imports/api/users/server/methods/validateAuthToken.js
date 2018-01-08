import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import createDummyUser from '../modifiers/createDummyUser';
import setConnectionStatus from '../modifiers/setConnectionStatus';

const ONLINE_CONNECTION_STATUS = 'online';

export default function validateAuthToken(credentials) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
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
    createDummyUser(meetingId, requesterUserId, requesterToken);
  } else if (User.validated) {
    setConnectionStatus(meetingId, requesterUserId, ONLINE_CONNECTION_STATUS);
  }

  const payload = {
    userId: requesterUserId,
    authToken: requesterToken,
  };

  Logger.info(`User '${
    requesterUserId
    }' is trying to validate auth token for meeting '${meetingId}'`);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}

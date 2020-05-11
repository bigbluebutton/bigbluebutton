import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import pendingAuthenticationsStore from '../store/pendingAuthentications';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import createDummyUser from '../modifiers/createDummyUser';
import setConnectionIdAndAuthToken from '../modifiers/setConnectionIdAndAuthToken';
import MeteorSyncConfirmation, { serverSynced } from '/imports/startup/server/meteorSyncComfirmation';

export default async function validateAuthToken(credentials) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ValidateAuthTokenReqMsg';
  await serverSynced;
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);
  pendingAuthenticationsStore.add(meetingId, requesterUserId, requesterToken, this);

  const sessionId = `${meetingId}-${requesterUserId}`;
  this.setUserId(sessionId);

  const User = Users.findOne({
    meetingId,
    userId: requesterUserId,
  });

  if (!User && MeteorSyncConfirmation.isSynced()) {
    createDummyUser(meetingId, requesterUserId, requesterToken);
  }

  setConnectionIdAndAuthToken(meetingId, requesterUserId, this.connection.id, requesterToken);
  const payload = {
    userId: requesterUserId,
    authToken: requesterToken,
  };

  Logger.info(`User '${requesterUserId}' is trying to validate auth token for meeting '${meetingId}' from connection '${this.connection.id}'`);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}

import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import pendingAuthenticationsStore from '../store/pendingAuthentications';
import BannedUsers from '../store/bannedUsers';
import Users from '/imports/api/users';

export default function validateAuthToken(meetingId, requesterUserId, requesterToken, externalId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ValidateAuthTokenReqMsg';

  // Check if externalId is banned from the meeting
  if (externalId) {
    if (BannedUsers.has(meetingId, externalId)) {
      Logger.warn(`A banned user with extId ${externalId} tried to enter in meeting ${meetingId}`);
      return { invalid: true, reason: 'User has been banned.' };
    }
  }

  // Check if a removed user is trying to access the meeting using the same sessionToken
  const isUserEjected = Users.findOne({ meetingId, authToken: requesterToken, ejected: true });

  if (isUserEjected) {
    Logger.warn(`An invalid sessionToken tried to validateAuthToken meetingId=${meetingId} authToken=${requesterToken}`);
    return { invalid: true, reason: 'User has been ejected.' };
  }

  // Store reference of methodInvocationObject ( to postpone the connection userId definition )
  pendingAuthenticationsStore.add(meetingId, requesterUserId, requesterToken, this);

  const payload = {
    userId: requesterUserId,
    authToken: requesterToken,
  };

  Logger.info(`User '${requesterUserId}' is trying to validate auth token for meeting '${meetingId}' from connection '${this.connection.id}'`);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}

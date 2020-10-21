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
      return { invalid: true, reason: 'User has been banned', error_type: 'user_banned' };
    }
  }

  // Prevent users who have left or been ejected to use the same sessionToken again.
  const isUserInvalid = Users.findOne({
    meetingId,
    userId: requesterUserId,
    authToken: requesterToken,
    $or: [{ ejected: true }, { loggedOut: true }],
  });

  if (isUserInvalid) {
    Logger.warn(`An invalid sessionToken tried to validateAuthToken meetingId=${meetingId} authToken=${requesterToken}`);
    return {
      invalid: true,
      reason: `User has an invalid sessionToken due to ${isUserInvalid.ejected ? 'ejection' : 'log out'}`,
      error_type: `invalid_session_token_due_to_${isUserInvalid.ejected ? 'eject' : 'log_out'}`,
    };
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

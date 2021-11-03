import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import AuthTokenValidation from '/imports/api/auth-token-validation';
import Users from '/imports/api/users';
import ClientConnections from '/imports/startup/server/ClientConnections';

export default function userLeaving(meetingId, userId, connectionId) {
  try {
    const REDIS_CONFIG = Meteor.settings.private.redis;
    const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
    const EVENT_NAME = 'UserLeaveReqMsg';

    check(userId, String);

    const selector = {
      meetingId,
      userId,
    };

    const user = Users.findOne(selector);

    if (!user) {
      Logger.info(`Skipping userLeaving. Could not find ${userId} in ${meetingId}`);
      return;
    }

    const auth = AuthTokenValidation.findOne({
      meetingId,
      userId,
    }, { sort: { updatedAt: -1 } });

    // If the current user connection is not the same that triggered the leave we skip
    if (auth?.connectionId !== connectionId) {
      Logger.info(`Skipping userLeaving. User connectionId=${user.connectionId} is different from requester connectionId=${connectionId}`);
      return false;
    }

    const payload = {
      userId,
      sessionId: meetingId,
      loggedOut: user.loggedOut || false,
    };

    ClientConnections.removeClientConnection(`${meetingId}--${userId}`, connectionId);

    Logger.info(`User '${userId}' is leaving meeting '${meetingId}'`);
    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, userId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method userLeaving ${err.stack}`);
  }
}

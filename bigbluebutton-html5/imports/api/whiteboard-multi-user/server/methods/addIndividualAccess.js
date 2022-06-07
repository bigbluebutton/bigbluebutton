import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { getMultiUser } from '/imports/api/whiteboard-multi-user/server/helpers';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';

export default function addIndividualAccess(whiteboardId, userId) {
  try {
    const REDIS_CONFIG = Meteor.settings.private.redis;
    const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
    const EVENT_NAME = 'ModifyWhiteboardAccessPubMsg';

    check(whiteboardId, String);
    check(userId, String);

    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    const multiUser = getMultiUser(meetingId, whiteboardId);

    if (!multiUser.includes(userId)) {
      multiUser.push(userId);

      const payload = {
        multiUser,
        whiteboardId,
      };

      RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method addIndividualAccess ${err.stack}`);
  }
}

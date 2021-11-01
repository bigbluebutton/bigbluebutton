import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function userShareWebcam(stream) {
  try {
    const REDIS_CONFIG = Meteor.settings.private.redis;
    const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
    const EVENT_NAME = 'UserBroadcastCamStartMsg';
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(stream, String);

    Logger.info(`user sharing webcam: ${meetingId} ${requesterUserId}`);

    // const actionName = 'joinVideo';
    /* TODO throw an error if user has no permission to share webcam
    if (!isAllowedTo(actionName, credentials)) {
      throw new Meteor.Error('not-allowed', `You are not allowed to share webcam`);
    } */

    const payload = {
      stream,
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method userShareWebcam ${err.stack}`);
  }
}

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function userShareWebcam(stream) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UserBroadcastCamStartMsg';
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  Logger.info(`user sharing webcam: ${meetingId} ${requesterUserId}`);

  check(stream, String);

  // const actionName = 'joinVideo';
  /* TODO throw an error if user has no permission to share webcam
  if (!isAllowedTo(actionName, credentials)) {
    throw new Meteor.Error('not-allowed', `You are not allowed to share webcam`);
  } */

  const payload = {
    stream,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}

import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';

export default function requestPresentationUploadToken(podId, filename, tmpPresId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'PresentationUploadTokenReqMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(podId, String);
    check(filename, String);
    check(tmpPresId, String);

    const payload = {
      podId,
      filename,
      tmpPresId
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method requestPresentationUploadToken ${err.stack}`);
  }
}

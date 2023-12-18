import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';

export default function setPresentationDownloadable(presentationId, downloadable, fileStateType) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SetPresentationDownloadablePubMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(downloadable, Match.Maybe(Boolean));
    check(presentationId, String);
    check(fileStateType, Match.Maybe(String));

    const payload = {
      presentationId,
      podId: 'DEFAULT_PRESENTATION_POD',
      downloadable,
      fileStateType,
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method setPresentationDownloadable ${err.stack}`);
  }
}

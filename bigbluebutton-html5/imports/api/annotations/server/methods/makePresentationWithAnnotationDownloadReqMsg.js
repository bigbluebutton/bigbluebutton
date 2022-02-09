import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';

export default function makePresentationWithAnnotationDownloadReqMsg() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'MakePresentationWithAnnotationDownloadReqMsg';
  const SECOND_EVENT_NAME = 'ExportPresentationWithAnnotationReqMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    const payload = {
      presId: "",
      allPages: false,
      pages: [2, 3, 8],
    };

    const payload2 = {
      parentMeetingId: "",
      allPages: false,
    };

    Logger.warn('************');
    Logger.warn(CHANNEL)
    Logger.warn(EVENT_NAME)
    Logger.warn(meetingId)
    Logger.warn(requesterUserId)
    Logger.warn('************');
    
    return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method makePresentationWithAnnotationDownloadReqMsg ${err.stack}`);
  }
}

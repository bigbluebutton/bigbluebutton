import RedisPubSub from '/imports/startup/server/redis';
import Captions from '/imports/api/captions';
import Logger from '/imports/startup/server/logger';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export default function updateOwner(meetingId, userId, locale) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UpdateCaptionOwnerPubMsg';

  try {
    check(meetingId, String);
    check(userId, String);
    check(locale, String);

    const pad = Captions.findOne({ meetingId, locale });

    if (!pad) {
      Logger.error(`Editing captions owner: ${padId}`);
      return;
    }

    const payload = {
      ownerId: userId,
      locale: pad.name,
      localeCode: pad.locale,
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, userId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method updateOwner ${err.stack}`);
  }
}

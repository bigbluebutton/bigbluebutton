import RedisPubSub from '/imports/startup/server/redis';
import Captions from '/imports/api/captions';
import Logger from '/imports/startup/server/logger';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export default function editCaptions(meetingId, userId, padId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UpdateCaptionOwnerPubMsg';

  check(meetingId, String);
  check(userId, String);
  check(padId, String);

  const pad = Captions.findOne({ meetingId, padId });

  if (!pad) return Logger.error(`Editing captions owner: ${padId}`);

  const { locale } = pad;

  check(locale, { locale: String, name: String });

  const payload = {
    ownerId: userId,
    locale: locale.name,
    localeCode: locale.locale,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, userId, payload);
}

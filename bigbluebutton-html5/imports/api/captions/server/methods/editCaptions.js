import RedisPubSub from '/imports/startup/server/redis';
import Captions from '/imports/api/captions';
import Logger from '/imports/startup/server/logger';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

const getIndex = (data, length) => length - data.length;

export default function editCaptions(padId, data) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'EditCaptionHistoryPubMsg';

  check(padId, String);
  check(data, String);

  const pad = Captions.findOne({ padId });

  if (!pad) {
    Logger.error(`Editing captions history: ${padId}`);
    return;
  }


  const {
    meetingId,
    ownerId,
    locale,
    length,
  } = pad;

  check(meetingId, String);
  check(ownerId, String);
  check(locale, { locale: String, name: String });
  check(length, Number);

  const index = getIndex(data, length);

  const payload = {
    startIndex: index,
    localeCode: locale.locale,
    locale: locale.name,
    endIndex: index,
    text: data,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, ownerId, payload);
}

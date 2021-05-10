import RedisPubSub from '/imports/startup/server/redis';
import Captions from '/imports/api/captions';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

const getIndex = (data, length) => length - data.length;

export default function editCaptions(padId, data) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'EditCaptionHistoryPubMsg';

  try {
    const { meetingId } = extractCredentials(this.userId);

    check(padId, String);
    check(data, String);
    check(meetingId, String);

    const pad = Captions.findOne({ padId, meetingId });

    if (!pad) {
      Logger.error(`Editing captions history: ${padId}`);
      return;
    }

    const {
      ownerId,
      locale,
      length,
    } = pad;

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

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, ownerId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method editCaptions ${err.stack}`);
  }
}

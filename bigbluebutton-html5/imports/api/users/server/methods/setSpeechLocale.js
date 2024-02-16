import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';

const LANGUAGES = Meteor.settings.public.app.audioCaptions.language.available;

export default function setSpeechLocale(locale, provider) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    const REDIS_CONFIG = Meteor.settings.private.redis;
    const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
    const EVENT_NAME = 'SetUserSpeechLocaleReqMsg';

    check(meetingId, String);
    check(requesterUserId, String);
    check(locale, String);
    check(provider, String);

    const payload = {
      locale,
      provider: provider !== 'webspeech' ? provider : '',
    };

    if (LANGUAGES.includes(locale) || locale === '' || locale === 'auto') {
      RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method setSpeechLocale ${err.stack}`);
  }
}

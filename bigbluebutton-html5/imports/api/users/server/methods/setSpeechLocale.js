import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import updateSpeechLocale from '../modifiers/updateSpeechLocale';
import { extractCredentials } from '/imports/api/common/server/helpers';

const LANGUAGES = Meteor.settings.public.app.audioCaptions.language.available;

export default async function setSpeechLocale(locale) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(locale, String);

    if (LANGUAGES.includes(locale) || locale === '') {
      await updateSpeechLocale(meetingId, requesterUserId, locale);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method setSpeechLocale ${err.stack}`);
  }
}

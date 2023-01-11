import { check } from 'meteor/check';
import updateSpeechLocale from '../modifiers/updateSpeechLocale';

export default function handleUserSpeechLocaleChanged({ body, header }, meetingId) {
  const { locale } = body;
  const { userId } = header;

  check(meetingId, String);
  check(userId, String);
  check(locale, String);

  return updateSpeechLocale(meetingId, userId, locale);
}

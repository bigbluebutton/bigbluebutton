import { RedisMessage } from '../types';

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  const eventName = `SetUserSpeechLocaleReqMsg`;

  const routing = {
    meetingId: sessionVariables['x-hasura-meetingid'] as String,
    userId: sessionVariables['x-hasura-userid'] as String
  };

  const header = { 
    name: eventName,
    meetingId: routing.meetingId,
    userId: routing.userId
  };

  const body = {
    locale: input.locale,
    provider: input.provider,
  };

  //TODO move validations to Akka-apps
  // const payload = {
  //   locale,
  //   provider: provider !== 'webspeech' ? provider : '',
  // };
  //
  // const LANGUAGES = Meteor.settings.public.app.audioCaptions.language.available;
  // if (LANGUAGES.includes(locale) || locale === '') {
  //   RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  // }

  return { eventName, routing, header, body };
}

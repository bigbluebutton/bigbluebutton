import { throwErrorIfInvalidInput } from '../imports/validation';
import { RedisMessage } from '../types';

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  const eventName = `SetUserCaptionLocaleReqMsg`;

  throwErrorIfInvalidInput(input,
    [
      {name: 'locale', type: 'string', required: true},
      {name: 'provider', type: 'string', required: true},
    ]
  )

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

  return { eventName, routing, header, body };
}

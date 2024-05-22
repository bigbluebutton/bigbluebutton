import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfInvalidInput(input,
      [
        {name: 'locale', type: 'string', required: true},
        {name: 'ownerUserId', type: 'string', required: true},
      ]
  )

  const eventName = `UpdateCaptionOwnerPubMsg`;

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
    name: '',
    locale: input.locale,
    ownerId: input.ownerUserId,
  };

  return { eventName, routing, header, body };
}

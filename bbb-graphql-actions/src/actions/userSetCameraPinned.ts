import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput, throwErrorIfNotModerator} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotModerator(sessionVariables);
  throwErrorIfInvalidInput(input,
      [
        {name: 'userId', type: 'string', required: true},
        {name: 'pinned', type: 'boolean', required: true},
      ]
  )

  const eventName = `ChangeUserPinStateReqMsg`;
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
    changedBy: routing.userId,
    userId: input.userId,
    pin: input.pinned
  };

  return { eventName, routing, header, body };
}

import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfInvalidInput(input,
      [
        {name: 'accepted', type: 'boolean', required: true},
      ]
  )

  const eventName = 'CameraRequestAnswerReqMsg';

  const routing = {
    meetingId: sessionVariables['x-hasura-meetingid'] as String,
    userId: sessionVariables['x-hasura-userid'] as String
  };

  const header = {
    name: eventName,
    meetingId: routing.meetingId,
    userId: routing.userId
  };

  // No userId: the handler answers for the sender, never for someone else.
  const body = {
    accepted: input.accepted
  };

  return { eventName, routing, header, body };
}

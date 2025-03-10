import { RedisMessage } from '../types';
import { throwErrorIfInvalidInput } from "../imports/validation";
import { ValidationError } from "../types/ValidationError";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfInvalidInput(input, [
    { name: 'id', type: 'string', required: true },
    { name: 'userId', type: 'string', required: true },
  ]);

  const eventName = 'LeaveAudioGroupReqMsg';

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
    id: input.id,
    userId: input.userId,
  };

  return { eventName, routing, header, body };
}

import { RedisMessage } from '../types';
import { isModerator, throwErrorIfInvalidInput } from "../imports/validation";

export default function buildRedisMessage(
  sessionVariables: Record<string, unknown>,
  input: Record<string, unknown>
): RedisMessage {
  throwErrorIfInvalidInput(input, [
    {name: 'userId', type: 'string', required: false},
    {name: 'deafened', type: 'boolean', required: true},
  ]);

  const eventName = `DeafenUserCmdMsg`;

  const routing = {
    meetingId: sessionVariables['x-hasura-meetingid'] as String,
    userId: sessionVariables['x-hasura-userid'] as String
  };

  const header = {
    name: eventName,
    meetingId: routing.meetingId,
    userId: routing.userId
  };

  const userId = isModerator(sessionVariables) && input.hasOwnProperty('userId')
    ? input.userId
    : routing.userId;

  const body = {
    deafenedBy: routing.userId,
    userId: userId,
    deaf: input.deafened
  };

  return { eventName, routing, header, body };
}

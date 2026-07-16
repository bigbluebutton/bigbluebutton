import { RedisMessage } from '../types';
import { throwErrorIfInvalidInput } from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfInvalidInput(input, [
    { name: 'userId', type: 'string', required: true },
    { name: 'entries', type: 'json', required: true },
    { name: 'scope', type: 'string', required: true },
  ]);

  const scope = input['scope'] as string;
  const validScopes = ['all', 'byMediaType', 'merge'];

  if (!validScopes.includes(scope)) {
    throw new Error(`scope must be one of: ${validScopes.join(', ')}`);
  }

  const entries = input['entries'] as Record<string, unknown>[];

  if (!Array.isArray(entries)) {
    throw new Error('entries must be an array');
  }

  entries.forEach((entry, index) => {
    throwErrorIfInvalidInput(entry, [
      { name: 'groupId', type: 'string', required: true },
      { name: 'mediaType', type: 'string', required: true },
      { name: 'sender', type: 'boolean', required: true },
      { name: 'receiver', type: 'boolean', required: true },
      { name: 'active', type: 'boolean', required: true },
    ]);
  });

  const eventName = 'SetUserMediaGroupStateReqMsg';

  const routing = {
    meetingId: sessionVariables['x-hasura-meetingid'] as string,
    userId: sessionVariables['x-hasura-userid'] as string
  };

  const header = {
    name: eventName,
    meetingId: routing.meetingId,
    userId: routing.userId
  };

  const body = {
    userId: input.userId,
    entries,
    scope: input.scope,
  };

  return { eventName, routing, header, body };
}

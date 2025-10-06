import { RedisMessage } from '../types';
import { throwErrorIfInvalidInput } from "../imports/validation";
import { ValidationError } from "../types/ValidationError";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfInvalidInput(input, [
    { name: 'id', type: 'string', required: true },
    { name: 'participant', type: 'json', required: true },
  ]);

  const participant = input['participant'] as Record<string, unknown>;

  throwErrorIfInvalidInput(participant, [
    { name: 'id', type: 'string', required: true },
    { name: 'participantType', type: 'string', required: true },
    { name: 'active', type: 'boolean', required: true },
  ]);

  const eventName = 'AudioGroupUpdateParticipantReqMsg';

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
    participant,
  };

  return { eventName, routing, header, body };
}

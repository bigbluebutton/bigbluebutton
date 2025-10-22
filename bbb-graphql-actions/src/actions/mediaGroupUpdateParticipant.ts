import { RedisMessage } from '../types';
import { throwErrorIfInvalidInput } from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfInvalidInput(input, [
    { name: 'id', type: 'string', required: true },
    { name: 'mediaType', type: 'string', required: true },
    { name: 'participant', type: 'json', required: true },
  ]);

  const participant = input['participant'] as Record<string, unknown>;

  throwErrorIfInvalidInput(participant, [
    { name: 'userId', type: 'string', required: true },
    { name: 'sender', type: 'boolean', required: true },
    { name: 'receiver', type: 'boolean', required: true },
    { name: 'active', type: 'boolean', required: true },
  ]);

  const eventName = 'MediaGroupUpdateParticipantReqMsg';

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
    id: input.id,
    mediaType: input.mediaType,
    participant,
  };

  return { eventName, routing, header, body };
}

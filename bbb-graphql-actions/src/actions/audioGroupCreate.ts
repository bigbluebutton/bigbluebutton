import { RedisMessage } from '../types';
import { throwErrorIfInvalidInput } from "../imports/validation";
import { ValidationError } from "../types/ValidationError";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  console.log('input', input);
  throwErrorIfInvalidInput(input, [
    { name: 'id', type: 'string', required: true },
    { name: 'senders', type: 'objectArray', required: false },
    { name: 'receivers', type: 'objectArray', required: false },
  ]);

  const senders = input['senders'] as Array<Record<string, unknown>>;
  const receivers = input['receivers'] as Array<Record<string, unknown>>;
  const validator = [
    { name: 'id', type: 'string', required: true },
    { name: 'participantType', type: 'string', required: true },
    { name: 'active', type: 'boolean', required: true },
  ];

  if (senders && senders.length > 0) {
    throwErrorIfInvalidInput(senders[0], [
      { name: 'id', type: 'string', required: true },
      { name: 'participantType', type: 'string', required: true },
      { name: 'active', type: 'boolean', required: true },
    ]);
  }

  if (receivers && receivers.length > 0) {
    throwErrorIfInvalidInput(receivers[0], [
      { name: 'id', type: 'string', required: true },
      { name: 'participantType', type: 'string', required: true },
      { name: 'active', type: 'boolean', required: true },
    ]);
  }

  const eventName = 'CreateAudioGroupReqMsg';

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
    senders: senders || [],
    receivers: receivers || [],
  };

  return { eventName, routing, header, body };
}

import { RedisMessage } from '../types';
import { InputParam, throwErrorIfInvalidInput } from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfInvalidInput(input, [
    { name: 'id', type: 'string', required: true },
    { name: 'mediaType', type: 'string', required: true },
    { name: 'locked', type: 'boolean', required: false },
    { name: 'record', type: 'boolean', required: false },
    { name: 'senders', type: 'objectArray', required: false },
    { name: 'receivers', type: 'objectArray', required: false },
  ]);

  const senders = input['senders'] as Array<Record<string, unknown>> | undefined;
  const receivers = input['receivers'] as Array<Record<string, unknown>> | undefined;
  const participantValidator: InputParam[] = [
    { name: 'userId', type: 'string', required: true },
    { name: 'active', type: 'boolean', required: true },
  ];

  senders?.forEach(sender => throwErrorIfInvalidInput(sender, participantValidator));
  receivers?.forEach(receiver => throwErrorIfInvalidInput(receiver, participantValidator));

  const eventName = 'CreateMediaGroupReqMsg';

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
    locked: input.locked,
    record: input.record,
    senders: senders || [],
    receivers: receivers || [],
  };

  return { eventName, routing, header, body };
}

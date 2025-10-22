import { RedisMessage } from '../types';
import { throwErrorIfInvalidInput } from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfInvalidInput(input, [
    { name: 'id', type: 'string', required: true },
    { name: 'mediaType', type: 'string', required: true },
    { name: 'userId', type: 'string', required: true },
  ]);

  const eventName = 'LeaveMediaGroupReqMsg';

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
    userId: input.userId,
  };

  return { eventName, routing, header, body };
}

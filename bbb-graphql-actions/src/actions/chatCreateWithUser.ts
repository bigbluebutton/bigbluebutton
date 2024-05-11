import { RedisMessage } from '../types';

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  const eventName = `CreateGroupChatReqMsg`;

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
    correlationId: `${routing.userId}-${Date.now()}`,
    msg: [],
    users: [input.userId],
    access: 'PRIVATE_ACCESS',
  };

  return { eventName, routing, header, body };
}

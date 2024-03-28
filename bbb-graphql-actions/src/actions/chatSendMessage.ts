import { RedisMessage } from '../types';

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  const eventName = `SendGroupChatMessageMsg`;

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
    msg: {
      correlationId: `${routing.userId}-${Date.now()}`,
      message: input.chatMessageInMarkdownFormat,
      sender: {
        id: routing.userId,
        name: '',
        role: ''
      }
    },
    chatId: input.chatId 
  };

  return { eventName, routing, header, body };
}

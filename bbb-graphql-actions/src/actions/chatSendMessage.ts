import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfInvalidInput(input,
      [
        {name: 'chatMessageInMarkdownFormat', type: 'string', required: true},
        {name: 'chatId', type: 'string', required: true},
        {name: 'replyToMessageId', type: 'string', required: false},
        {name: 'metadata', type: 'json', required: false}
      ]
  )

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
      },
      replyToMessageId: input.replyToMessageId || "",
      metadata: input.metadata || {},
    },
    chatId: input.chatId 
  };

  return { eventName, routing, header, body };
}

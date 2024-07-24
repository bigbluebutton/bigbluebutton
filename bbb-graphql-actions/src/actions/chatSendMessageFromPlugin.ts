import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfInvalidInput(input,
      [
        {name: 'chatId', type: 'string', required: true},
        {name: 'chatMessageInMarkdownFormat', type: 'string', required: true},
        {name: 'pluginName', type: 'string', required: true},
        {name: 'pluginCustomMetadata', type: 'string', required: false},
      ]
  )

  const eventName = `SendGroupChatMessageFromPluginMsg`;
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
      metadata: {
        pluginName: input.pluginName,
        pluginCustomMetadata: input.pluginCustomMetadata || '', 
      }
    },
    chatId: input.chatId 
  };

  return { eventName, routing, header, body };
}

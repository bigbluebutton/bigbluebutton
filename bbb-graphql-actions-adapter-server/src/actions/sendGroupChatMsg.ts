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

  // TODO - move this property to akka and make it read the setting chat.moderatorChatEmphasized also
  const chatEmphasizedText = (sessionVariables['x-hasura-moderatorinmeeting'] as string).length>0;

  const body = { 
    msg: {
      correlationId: `${routing.userId}-${Date.now()}`,
      chatEmphasizedText,
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

import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput} from "../imports/validation";
import {ValidationError} from "../types/ValidationError";
import { EMOJI_REGEX } from '../imports/emojiValidation';

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfInvalidInput(input,
      [
        {name: 'chatId', type: 'string', required: true},
        {name: 'messageId', type: 'string', required: true},
        {name: 'reactionEmoji', type: 'string', required: true},
      ]
  )

  if(typeof input.reactionEmoji !== 'string' || !EMOJI_REGEX.test(input.reactionEmoji)) {
    throw new ValidationError(`Parameter 'reactionEmoji' contains an invalid Emoji`, 400);
  }

  const eventName = `SendGroupChatMessageReactionReqMsg`;
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
    chatId: input.chatId,
    messageId: input.messageId,
    reactionEmoji: input.reactionEmoji,
  };

  return { eventName, routing, header, body };
}

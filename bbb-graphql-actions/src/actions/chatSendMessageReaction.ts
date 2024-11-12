import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput} from "../imports/validation";
import {ValidationError} from "../types/ValidationError";
const emojiRegex = /^(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F|\p{Emoji_Modifier_Base}|\p{Regional_Indicator}{2})(\u200D(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F|\p{Emoji_Modifier_Base}|\p{Regional_Indicator}{2}))*$/u;

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfInvalidInput(input,
      [
        {name: 'chatId', type: 'string', required: true},
        {name: 'messageId', type: 'string', required: true},
        {name: 'reactionEmoji', type: 'string', required: true},
        {name: 'reactionEmojiId', type: 'string', required: true},
      ]
  )

  if(typeof input.reactionEmoji !== 'string' || !emojiRegex.test(input.reactionEmoji)) {
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
    reactionEmojiId: input.reactionEmojiId,
  };

  return { eventName, routing, header, body };
}

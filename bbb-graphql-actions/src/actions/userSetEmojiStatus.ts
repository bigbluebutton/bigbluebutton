import { RedisMessage } from '../types';
import {throwErrorIfDifferentUserNotModerator} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfDifferentUserNotModerator(sessionVariables, input);
  const eventName = `ChangeUserEmojiCmdMsg`;

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
    userId: input.userId || routing.userId,
    emoji: input.emoji
  };

  return { eventName, routing, header, body };
}

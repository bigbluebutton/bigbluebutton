import { RedisMessage } from '../types';

export default function buildRedisMessage(
  sessionVariables: Record<string, unknown>,
  input: Record<string, unknown>
): RedisMessage {
  const eventName = `SetUserSpeechOptionsReqMsg`;

  const routing = {
    meetingId: sessionVariables['x-hasura-meetingid'] as String,
    userId: sessionVariables['x-hasura-userid'] as String,
  };

  const header = {
    name: eventName,
    meetingId: routing.meetingId,
    userId: routing.userId,
  };

  const body = {
    partialUtterances: input.partialUtterances,
    minUtteranceLength: input.minUtteranceLength,
  };

  return { eventName, routing, header, body };
}

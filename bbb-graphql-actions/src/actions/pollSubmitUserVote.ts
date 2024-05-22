import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfInvalidInput(input,
      [
        {name: 'pollId', type: 'string', required: true},
        {name: 'answerIds', type: 'intArray', required: true},
      ]
  )

  const eventName = `RespondToPollReqMsg`;

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
    requesterId: routing.userId,
    pollId: input.pollId,
    questionId: 0,
    answerIds: input.answerIds
  };

  return { eventName, routing, header, body };
}

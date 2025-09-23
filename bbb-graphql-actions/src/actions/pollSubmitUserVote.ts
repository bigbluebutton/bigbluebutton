import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput} from "../imports/validation";
import {ValidationError} from "../types/ValidationError";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfInvalidInput(input,
      [
        {name: 'pollId', type: 'string', required: true},
        {name: 'answerIds', type: 'intArray', required: true},
      ]
  )

  const eventName = `RespondToPollReqMsg`;

  if(Array.isArray(input.answerIds) && input.answerIds.length > 100) {
    throw new ValidationError('Parameter `answerIds` exceeds the maximum allowed limit of 100 options', 400);
  }

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

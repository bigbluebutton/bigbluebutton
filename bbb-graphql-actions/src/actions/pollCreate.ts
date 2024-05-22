import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput, throwErrorIfNotPresenter} from "../imports/validation";
import {ValidationError} from "../types/ValidationError";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotPresenter(sessionVariables);
  throwErrorIfInvalidInput(input,
      [
        {name: 'pollId', type: 'string', required: true},
        {name: 'pollType', type: 'string', required: true},
        {name: 'secretPoll', type: 'boolean', required: true},
        {name: 'question', type: 'string', required: true},
        {name: 'isMultipleResponse', type: 'boolean', required: true},
        {name: 'answers', type: 'stringArray', required: false},
      ]
  )

  const eventName = input.pollType === 'CUSTOM' ? `StartCustomPollReqMsg` : `StartPollReqMsg`

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
    pollId: `${input.pollId}/${new Date().getTime()}`,
    pollType: input.pollType,
    secretPoll: input.secretPoll,
    question: input.question,
    isMultipleResponse: input.isMultipleResponse,
  };

  if (input.pollType === 'CUSTOM') {
    if(!input.hasOwnProperty('answers')) {
      throw new ValidationError('Field `answers` is required for Custom polls.', 400);
    }

    if(!Array.isArray(input.answers) || input.answers.length < 2) {
      throw new ValidationError('Field `answers` should contain at least two answers.', 400);
    }

    // @ts-ignore
    body.answers = input.answers;
  }

  return { eventName, routing, header, body };
}

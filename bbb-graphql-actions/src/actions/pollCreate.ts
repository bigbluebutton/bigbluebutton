import { RedisMessage } from '../types';
import {throwErrorIfNotPresenter} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotPresenter(sessionVariables);
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
    //TODO Validate answers as it is required for custom and not required in Hasura

    // @ts-ignore
    body.answers = input.answers;
  }

  return { eventName, routing, header, body };
}

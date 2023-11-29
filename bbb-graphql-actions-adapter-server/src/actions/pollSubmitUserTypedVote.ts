import { RedisMessage } from '../types';

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  const eventName = `RespondToTypedPollReqMsg`;

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
    answer: input.answer
  };

  //TODO Validate answer length in the Backend (Meteor.settings.public.poll.maxTypedAnswerLength)
  //TODO Check if answer exists and use the same ID (backend)

  return { eventName, routing, header, body };
}

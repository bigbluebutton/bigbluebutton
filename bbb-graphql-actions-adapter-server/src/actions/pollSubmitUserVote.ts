import { RedisMessage } from '../types';

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
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

  //case class RespondToPollReqMsgBody(requesterId: String, pollId: String, questionId: Int, answerIds: Seq[Int])
  const body = {
    requesterId: routing.userId,
    pollId: input.pollId,
    questionId: 0,
    answerIds: input.answerIds
  };

  return { eventName, routing, header, body };
}

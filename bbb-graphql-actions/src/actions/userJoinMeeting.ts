import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfInvalidInput(input,
      [
        {name: 'authToken', type: 'string', required: true},
        {name: 'clientType', type: 'string', required: true},
        {name: 'clientIsMobile', type: 'boolean', required: true},
      ]
  )

  const eventName = `UserJoinMeetingReqMsg`;

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
    userId: routing.userId,
    authToken: input.authToken,
    clientType: input.clientType,
    clientIsMobile: input.clientIsMobile,
  };

  return { eventName, routing, header, body };
}

import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput, throwErrorIfNotModerator} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotModerator(sessionVariables);

  throwErrorIfInvalidInput(input,
      [
        {name: 'userId', type: 'string', required: true},
        {name: 'fromBreakoutRoomId', type: 'string', required: true},
        {name: 'toBreakoutRoomId', type: 'string', required: true},
      ]
  )

  const eventName = 'ChangeUserBreakoutReqMsg';

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
    meetingId: routing.meetingId,
    userId: input.userId,
    fromBreakoutId: input.fromBreakoutRoomId,
    toBreakoutId: input.toBreakoutRoomId,
  };

  return { eventName, routing, header, body };
}

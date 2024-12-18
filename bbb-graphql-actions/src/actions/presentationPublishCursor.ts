import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfInvalidInput(input,
      [
        {name: 'whiteboardId', type: 'string', required: true},
        {name: 'xPercent', type: 'number', required: true},
        {name: 'yPercent', type: 'number', required: true},
      ]
  )

  const eventName = `SendCursorPositionPubMsg`;

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
    whiteboardId: input.whiteboardId,
    xPercent: input.xPercent,
    yPercent: input.yPercent,
  };

  return { eventName, routing, header, body };
}

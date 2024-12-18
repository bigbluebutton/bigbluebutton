import { RedisMessage } from '../types';
import { ValidationError } from '../types/ValidationError';
import {throwErrorIfInvalidInput} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfInvalidInput(input,
      [
        {name: 'pageId', type: 'string', required: true},
        {name: 'annotations', type: 'jsonArray', required: true},
      ]
  )

  const eventName = `SendWhiteboardAnnotationsPubMsg`;

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
    whiteboardId: input.pageId,
    annotations: input.annotations,
  };

  return { eventName, routing, header, body };
}

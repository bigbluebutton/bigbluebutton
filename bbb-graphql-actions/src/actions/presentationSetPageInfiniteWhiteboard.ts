import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput, throwErrorIfNotPresenter} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotPresenter(sessionVariables);
  throwErrorIfInvalidInput(input,
    [
      {name: 'infiniteWhiteboard', type: 'boolean', required: true},
      {name: 'pageId', type: 'string', required: true},
    ]
  )

  const eventName = `SetPageInfiniteWhiteboardPubMsg`;

  const routing = {
    meetingId: sessionVariables['x-hasura-meetingid'] as string,
    userId: sessionVariables['x-hasura-userid'] as string
  };

  const header = { 
    name: eventName,
    meetingId: routing.meetingId,
    userId: routing.userId
  };

  const body = {
    pageId: input.pageId,
    infiniteWhiteboard: input.infiniteWhiteboard,
  };

  return { eventName, routing, header, body };
}

import { RedisMessage } from '../types';
import { ValidationError } from '../types/ValidationError';
import {throwErrorIfInvalidInput, throwErrorIfNotPresenter} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotPresenter(sessionVariables);
  throwErrorIfInvalidInput(input,
      [
        {name: 'presentationId', type: 'string', required: true},
        {name: 'pageId', type: 'string', required: true},
      ]
  )

  const eventName = `SetCurrentPagePubMsg`;

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
    podId: 'DEFAULT_PRESENTATION_POD',
    presentationId: input.presentationId,
    pageId: input.pageId,
  };

  return { eventName, routing, header, body };
}

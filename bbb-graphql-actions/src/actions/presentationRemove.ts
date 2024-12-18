import { RedisMessage } from '../types';
import { ValidationError } from '../types/ValidationError';
import {throwErrorIfInvalidInput, throwErrorIfNotPresenter} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfInvalidInput(input,
      [
        {name: 'presentationId', type: 'string', required: true},
      ]
  )

  throwErrorIfNotPresenter(sessionVariables);
  const eventName = `RemovePresentationPubMsg`;

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
    presentationId: input.presentationId
  };

  return { eventName, routing, header, body };
}

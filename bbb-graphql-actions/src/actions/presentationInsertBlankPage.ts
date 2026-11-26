import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput, throwErrorIfNotPresenter} from "../imports/validation";

// Inserts a blank page into presentationId at position, sized as the page before it. seenTotalPages is
// the totalPages the client read together with position, so the server can follow the position if the
// order changed meanwhile. navigate asks to be taken to the new page.
export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotPresenter(sessionVariables);
  throwErrorIfInvalidInput(input,
      [
        {name: 'presentationId', type: 'string', required: true},
        {name: 'position', type: 'int', required: true},
        {name: 'seenTotalPages', type: 'int', required: true},
        {name: 'navigate', type: 'boolean', required: true},
      ]
  )

  const eventName = `InsertBlankPagePubMsg`;

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
    position: input.position,
    seenTotalPages: input.seenTotalPages,
    navigate: input.navigate,
  };

  return { eventName, routing, header, body };
}

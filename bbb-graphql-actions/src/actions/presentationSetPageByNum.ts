import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput, throwErrorIfNotPresenter} from "../imports/validation";

// Goes to the page at position pageNum. seenTotalPages is the totalPages the client read together
// with pageNum (0 when unknown), so the server can follow the page if the order changed meanwhile.
export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotPresenter(sessionVariables);
  throwErrorIfInvalidInput(input,
      [
        {name: 'presentationId', type: 'string', required: true},
        {name: 'pageNum', type: 'int', required: true},
        {name: 'seenTotalPages', type: 'int', required: true},
      ]
  )

  const eventName = `SetCurrentPageByNumPubMsg`;

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
    pageNum: input.pageNum,
    seenTotalPages: input.seenTotalPages,
  };

  return { eventName, routing, header, body };
}

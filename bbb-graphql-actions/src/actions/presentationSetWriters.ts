import { RedisMessage } from '../types';
import { ValidationError } from '../types/ValidationError';
import {throwErrorIfInvalidInput, throwErrorIfNotPresenter} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotPresenter(sessionVariables);
  throwErrorIfInvalidInput(input,
      [
        {name: 'pageId', type: 'string', required: true},
        {name: 'usersIds', type: 'stringArray', required: true},
      ]
  )

  const eventName = `ModifyWhiteboardAccessPubMsg`;

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
    multiUser: input.usersIds
  };

  return { eventName, routing, header, body };
}

import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput, throwErrorIfNotPresenter} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotPresenter(sessionVariables);
  throwErrorIfInvalidInput(input,
      [
        {name: 'presentationId', type: 'string', required: true},
        {name: 'downloadable', type: 'boolean', required: true},
        {name: 'fileStateType', type: 'string', required: true},
      ]
  )

  const eventName = `SetPresentationDownloadablePubMsg`;

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
    downloadable: input.downloadable,
    fileStateType: input.fileStateType,
  };

  return { eventName, routing, header, body };
}

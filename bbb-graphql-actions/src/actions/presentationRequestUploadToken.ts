import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput, throwErrorIfNotPresenter} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotPresenter(sessionVariables);
  throwErrorIfInvalidInput(input,
      [
        {name: 'podId', type: 'string', required: true},
        {name: 'filename', type: 'string', required: true},
        {name: 'uploadTemporaryId', type: 'string', required: true},
      ]
  )

  const eventName = `PresentationUploadTokenReqMsg`;

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
    podId: input.podId,
    filename: input.filename,
    uploadTemporaryId: input.uploadTemporaryId,
  };

  return { eventName, routing, header, body };
}

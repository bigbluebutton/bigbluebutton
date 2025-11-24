import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput, throwErrorIfNotPresenter} from "../imports/validation";
import { ValidationError } from '../types/ValidationError';

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

  const filename: string = input.filename as string;
  const uploadTemporaryId: string = input.uploadTemporaryId as string;
  if(uploadTemporaryId.length > 500) {
    throw new ValidationError('Parameter uploadTemporaryId exceeds maximum allowed length of 500 characters', 400);
  }

  if(filename.length > 500) {
    throw new ValidationError('Parameter filename exceeds maximum allowed length of 500 characters', 400);
  }

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

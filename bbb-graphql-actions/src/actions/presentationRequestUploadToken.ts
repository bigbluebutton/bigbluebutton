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
        // The intent of an insert of pages into presentation insertIntoPresentationId (optional).
        {name: 'insertIntoPresentationId', type: 'string', required: false},
        {name: 'insertAtPosition', type: 'int', required: false},
        {name: 'insertSeenTotalPages', type: 'int', required: false},
        {name: 'insertNavigate', type: 'boolean', required: false},
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

  const insertIntoPresentationId = (input.insertIntoPresentationId as string | undefined) ?? '';
  // The name goes to the database with the insert, and text columns cannot hold U+0000.
  if (insertIntoPresentationId !== '' && filename.includes('\u0000')) {
    throw new ValidationError('Parameter filename contains an invalid character', 400);
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
    // Always sent: bbb-apps-akka refuses a message with a missing field. Empty when not an insert.
    insertIntoPresentationId,
    insertAtPosition: (input.insertAtPosition as number | undefined) ?? 0,
    insertSeenTotalPages: (input.insertSeenTotalPages as number | undefined) ?? 0,
    insertNavigate: (input.insertNavigate as boolean | undefined) ?? false,
  };

  return { eventName, routing, header, body };
}

import { RedisMessage } from '../types';
import { ValidationError } from '../types/ValidationError';
import {throwErrorIfNotPresenter} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotPresenter(sessionVariables);
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

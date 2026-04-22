import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput} from "../imports/validation";
import {ValidationError} from "../types/ValidationError";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfInvalidInput(input,
      [
        {name: 'stream', type: 'string', required: true},
        {name: 'contentType', type: 'string', required: true},
        {name: 'hasAudio', type: 'boolean', required: false},
      ]
  )

  const allowedContentTypes = ['screenshare', 'camera'];
  if (typeof input.contentType !== 'string' || !allowedContentTypes.includes(input.contentType)) {
    throw new ValidationError(
        `Field contentType is invalid (allowed ${allowedContentTypes.join(' or ')})`,
        400
    );
  }

  const eventName = `UserBroadcastCamStartMsg`;

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
    stream: input.stream,
    contentType: input.contentType,
    hasAudio: input.hasAudio || false
  };

  return { eventName, routing, header, body };
}

import { RedisMessage } from '../types';
import { ValidationError } from '../types/ValidationError';

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  const eventName = `SendWhiteboardAnnotationsPubMsg`;

  const routing = {
    meetingId: sessionVariables['x-hasura-meetingid'] as String,
    userId: sessionVariables['x-hasura-userid'] as String
  };

  const header = {
    name: eventName,
    meetingId: routing.meetingId,
    userId: routing.userId
  };

  if(typeof input.annotations !== 'object' || !Array.isArray(input.annotations)) {
    throw new ValidationError('Field `annotations` contains an invalid Json Array.', 400);
  }

  const body = {
    whiteboardId: input.pageId,
    annotations: input.annotations,
    html5InstanceId: '', //TODO remove this prop from bbb-common-msg
  };

  return { eventName, routing, header, body };
}

import { RedisMessage } from '../types';
import { throwErrorIfIntOutOfRange, throwErrorIfNotPresenterNorModerator } from '../imports/validation';

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotPresenterNorModerator(sessionVariables);
  // The upper bound depends on the meeting's client settings, which only akka-apps reads.
  throwErrorIfIntOutOfRange('cameraPageSize', input.cameraPageSize, 1, 2 ** 31 - 1);

  const eventName = 'SetCameraPageSizeReqMsg';

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
    cameraPageSize: input.cameraPageSize
  };

  return { eventName, routing, header, body };
}

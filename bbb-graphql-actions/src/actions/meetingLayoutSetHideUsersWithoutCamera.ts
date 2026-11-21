import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput, throwErrorIfNotPresenterNorModerator} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotPresenterNorModerator(sessionVariables);
  throwErrorIfInvalidInput(input,
      [
        {name: 'hideUsersWithoutCamera', type: 'boolean', required: true},
      ]
  )

  const eventName = 'SetHideUsersWithoutCameraReqMsg';

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
    hideUsersWithoutCamera: input.hideUsersWithoutCamera
  };

  return { eventName, routing, header, body };
}

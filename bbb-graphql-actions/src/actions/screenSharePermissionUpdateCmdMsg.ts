import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput, throwErrorIfNotModerator} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotModerator(sessionVariables);
  throwErrorIfInvalidInput(input,
      [
        {name: 'screenShareBroadcastAllowedFor', type: 'string', required: true},
        {name: 'viewerScreenShareViewAllowedFor', type: 'string', required: true},
        {name: 'setBy', type: 'string', required: true},
      ]
  )

  const eventName = 'ScreenSharePermissionUpdateCmdMsg';

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
    setBy: routing.userId,
    screenShareBroadcastAllowedFor: input.screenShareBroadcastAllowedFor,
    viewerScreenShareViewAllowedFor: input.viewerScreenShareViewAllowedFor,
  };

  return { eventName, routing, header, body };
}

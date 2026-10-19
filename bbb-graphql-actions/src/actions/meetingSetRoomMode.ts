import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput, throwErrorIfNotModerator} from "../imports/validation";
import {ValidationError} from "../types/ValidationError";

// Same shape check as SetRoomModeCmdMsgHdlr in akka-apps.
const ROOM_MODE_PATTERN = /^([a-z][a-z0-9-]{0,31})?$/;

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotModerator(sessionVariables);
  throwErrorIfInvalidInput(input,
      [
        {name: 'roomMode', type: 'string', required: true},
      ]
  )

  if (!ROOM_MODE_PATTERN.test(input.roomMode as string)) {
    throw new ValidationError('Invalid room mode: expected lowercase letters, digits and hyphens (up to 32), or empty.', 400);
  }

  const eventName = 'SetRoomModeCmdMsg';

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
    roomMode: input.roomMode,
    setBy: routing.userId,
  };

  return { eventName, routing, header, body };
}

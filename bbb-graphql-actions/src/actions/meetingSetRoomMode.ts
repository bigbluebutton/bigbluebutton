import { RedisMessage } from '../types';
import {isBreakout, throwErrorIfInvalidInput, throwErrorIfNotModerator} from "../imports/validation";
import {ValidationError} from "../types/ValidationError";

// Same shape check as SetRoomModeCmdMsgHdlr in akka-apps. Empty is only the
// default: once set, a room is never reopened to the pre-flight panel.
const ROOM_MODE_PATTERN = /^[a-z][a-z0-9-]{0,31}$/;

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotModerator(sessionVariables);
  // Akka refuses it too (SetRoomModeCmdMsgHdlr), but only after answering true,
  // and with ejectOnViolation on it ejects the moderator from the breakout.
  if (isBreakout(sessionVariables)) {
    throw new ValidationError('Room mode cannot be set in a breakout room.', 400);
  }
  throwErrorIfInvalidInput(input,
      [
        {name: 'roomMode', type: 'string', required: true},
      ]
  )

  if (!ROOM_MODE_PATTERN.test(input.roomMode as string)) {
    throw new ValidationError('Invalid room mode: expected lowercase letters, digits and hyphens (up to 32), starting with a letter.', 400);
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

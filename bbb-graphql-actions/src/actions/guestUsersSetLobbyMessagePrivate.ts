import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput, throwErrorIfNotModerator} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotModerator(sessionVariables);
  throwErrorIfInvalidInput(input,
      [
        {name: 'guestId', type: 'string', required: true},
        {name: 'message', type: 'string', required: true},
      ]
  )

  const eventName = 'SetPrivateGuestLobbyMessageCmdMsg';

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
    guestId: input.guestId,
    message: input.message
  };

  //TODO parseMessage(message)

  return { eventName, routing, header, body };
}

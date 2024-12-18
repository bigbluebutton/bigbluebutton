import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput, throwErrorIfNotModerator} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotModerator(sessionVariables);
  throwErrorIfInvalidInput(input,
      [
        {name: 'guests', type: 'objectArray', required: true},
      ]
  )

  const guests = input['guests'] as Array<Record<string, unknown>>;
  if(guests.length > 0) {
    throwErrorIfInvalidInput(guests[0],
        [
          {name: 'guest', type: 'string', required: true},
          {name: 'status', type: 'string', required: true},
        ]
    )
  }

  const eventName = 'GuestsWaitingApprovedMsg';

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
    approvedBy: routing.userId,
    guests: input.guests
  };

  return { eventName, routing, header, body };
}

import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfInvalidInput(input,
      [
        {name: 'exitReason', type: 'string', required: true},
      ]
  )

  const eventName = `ChangeUserExitReasonCmdMsg`;
  //TODO Akka does not expect to receive this message

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
    userId: routing.userId,
    exitReason: input.exitReason
  };

  return { eventName, routing, header, body };
}

import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput, throwErrorIfNotModerator} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotModerator(sessionVariables);
  throwErrorIfInvalidInput(input,
      [
        {name: 'stopwatch', type: 'boolean', required: true},
        {name: 'running', type: 'boolean', required: true},
        {name: 'time', type: 'int', required: true},
        {name: 'track', type: 'string', required: false},
      ]
  )

  const eventName = `ActivateTimerReqMsg`;

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
    stopwatch: true,
    running: false,
    time: input.time, //Meteor.settings.public.timer * 60000
    accumulated: 0,
    timestamp: 0,
    track: input.track ?? 'noTrack',
  };

  return { eventName, routing, header, body };
}

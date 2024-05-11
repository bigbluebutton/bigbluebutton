import { RedisMessage } from '../types';
import {throwErrorIfNotModerator} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotModerator(sessionVariables);
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

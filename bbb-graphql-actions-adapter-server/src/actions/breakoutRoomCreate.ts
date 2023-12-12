import { RedisMessage } from '../types';
import {throwErrorIfNotModerator} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotModerator(sessionVariables);
  const eventName = 'CreateBreakoutRoomsCmdMsg';

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
    meetingId: routing.meetingId,
    record: input.record,
    captureNotes: input.captureNotes,
    captureSlides: input.captureSlides,
    durationInMinutes: input.durationInMinutes,
    sendInviteToModerators: input.sendInviteToModerators,
    rooms: input.rooms,
  };

  // TODO check if akka-apps apply this validation
  // const BREAKOUT_LIM = Meteor.settings.public.app.breakouts.breakoutRoomLimit;
  // const MIN_BREAKOUT_ROOMS = 2;
  // const MAX_BREAKOUT_ROOMS = BREAKOUT_LIM > MIN_BREAKOUT_ROOMS ? BREAKOUT_LIM : MIN_BREAKOUT_ROOMS;
  // if (rooms.length > MAX_BREAKOUT_ROOMS) {
  //   Logger.info(`Attempt to create breakout rooms with invalid number of rooms in meeting id=${meetingId}`);
  //   return;
  // }

  return { eventName, routing, header, body };
}

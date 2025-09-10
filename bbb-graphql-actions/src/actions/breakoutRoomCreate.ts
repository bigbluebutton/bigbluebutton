import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput, throwErrorIfNotModerator} from "../imports/validation";
import {ValidationError} from "../types/ValidationError";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotModerator(sessionVariables);
  const eventName = 'CreateBreakoutRoomsCmdMsg';

  throwErrorIfInvalidInput(input,
      [
        {name: 'record', type: 'boolean', required: true},
        {name: 'captureNotes', type: 'boolean', required: true},
        {name: 'captureSlides', type: 'boolean', required: true},
        {name: 'durationInMinutes', type: 'int', required: true},
        {name: 'sendInviteToModerators', type: 'boolean', required: true},
        {name: 'rooms', type: 'objectArray', required: true},
      ]
  )

    const breakoutRooms = input['rooms'] as Array<Record<string, unknown>>;
    if(breakoutRooms.length < 2) {
        throw new ValidationError('It is required to set two or more rooms', 400);
    }

  throwErrorIfInvalidInput(breakoutRooms[0],
      [
        {name: 'captureNotesFilename', type: 'string', required: true},
        {name: 'captureSlidesFilename', type: 'string', required: true},
        {name: 'freeJoin', type: 'boolean', required: true},
        {name: 'isDefaultName', type: 'boolean', required: true},
        {name: 'name', type: 'string', required: true},
        {name: 'sequence', type: 'int', required: true},
        {name: 'shortName', type: 'string', required: true},
        {name: 'users', type: 'stringArray', required: true},
      ]
  )


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

  return { eventName, routing, header, body };
}

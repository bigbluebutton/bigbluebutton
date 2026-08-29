import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput, throwErrorIfNotPresenterNorModerator} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotPresenterNorModerator(sessionVariables);
  throwErrorIfInvalidInput(input,
      [
        {name: 'userIds', type: 'stringArray', required: false},
        {name: 'allUsers', type: 'boolean', required: true},
        {name: 'whiteboardWriteAccess', type: 'boolean', required: true},
      ]
  )

  const eventName = `SetUserWhiteboardWriteAccessReqMsg`;

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
    userIds: input.userIds || [],
    allUsers: input.allUsers,
    whiteboardWriteAccess: input.whiteboardWriteAccess
  };

  return { eventName, routing, header, body };
}

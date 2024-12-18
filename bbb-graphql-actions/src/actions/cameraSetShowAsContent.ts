import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput, throwErrorIfNotModerator, throwErrorIfNotPresenter} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotPresenter(sessionVariables);
  throwErrorIfInvalidInput(input,
      [
        {name: 'streamId', type: 'string', required: true},
        {name: 'showAsContent', type: 'boolean', required: true},
      ]
  )

  const eventName = `SetCamShowAsContentReqMsg`;
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
    setBy: routing.userId,
    streamId: input.streamId,
    showAsContent: input.showAsContent
  };

  return { eventName, routing, header, body };
}

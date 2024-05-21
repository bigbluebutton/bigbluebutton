import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput, throwErrorIfNotModerator} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotModerator(sessionVariables);
  throwErrorIfInvalidInput(input,
      [
        {name: 'muted', type: 'boolean', required: true},
        {name: 'exceptPresenter', type: 'boolean', required: false},
      ]
  )

  const eventName =
      (input.exceptPresenter || false) ?
      'MuteAllExceptPresentersCmdMsg' :
      'MuteMeetingCmdMsg';

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
    mutedBy: routing.userId,
    mute: input.muted
  };

  return { eventName, routing, header, body };
}

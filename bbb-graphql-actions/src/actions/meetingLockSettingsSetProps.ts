import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput, throwErrorIfNotModerator} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotModerator(sessionVariables);
  throwErrorIfInvalidInput(input,
      [
        {name: 'disableCam', type: 'boolean', required: true},
        {name: 'disableMic', type: 'boolean', required: true},
        {name: 'disablePrivChat', type: 'boolean', required: true},
        {name: 'disablePubChat', type: 'boolean', required: true},
        {name: 'disableNotes', type: 'boolean', required: true},
        {name: 'isolateUsers', type: 'boolean', required: true},
        {name: 'lockOnJoin', type: 'boolean', required: true},
        {name: 'lockOnJoinConfigurable', type: 'boolean', required: true},
        {name: 'hideViewersCursor', type: 'boolean', required: true},
        {name: 'hideViewersAnnotation', type: 'boolean', required: true},
        {name: 'presenterPolicy', type: 'string', required: true},
      ]
  )

  const ALLOWED_PRESENTER_POLICIES = ['moderatorOnly', 'requireApproval', 'freeForAll'];
  if (!ALLOWED_PRESENTER_POLICIES.includes(input.presenterPolicy as string)) {
    throw new Error(`Invalid presenterPolicy: ${input.presenterPolicy}`);
  }

  const eventName = 'ChangeLockSettingsInMeetingCmdMsg';

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
    disableCam: input.disableCam,
    disableMic: input.disableMic,
    disablePrivChat: input.disablePrivChat,
    disablePubChat: input.disablePubChat,
    disableNotes: input.disableNotes,
    isolateUsers: input.isolateUsers,
    lockOnJoin: input.lockOnJoin,
    lockOnJoinConfigurable: input.lockOnJoinConfigurable,
    hideViewersCursor: input.hideViewersCursor,
    hideViewersAnnotation: input.hideViewersAnnotation,
    presenterPolicy: input.presenterPolicy,
  };

  return { eventName, routing, header, body };
}

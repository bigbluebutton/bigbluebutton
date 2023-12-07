import { RedisMessage } from '../types';
import {throwErrorIfNotModerator} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotModerator(sessionVariables);
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
    hideUserList: input.hideUserList,
    lockOnJoin: input.lockOnJoin,
    lockOnJoinConfigurable: input.lockOnJoinConfigurable,
    hideViewersCursor: input.hideViewersCursor,
    hideViewersAnnotation: input.hideViewersAnnotation,
  };

  return { eventName, routing, header, body };
}

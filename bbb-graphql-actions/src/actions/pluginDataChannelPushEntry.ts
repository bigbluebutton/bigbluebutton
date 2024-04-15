import { RedisMessage } from '../types';
import { ValidationError } from '../types/ValidationError';

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  const eventName = `PluginDataChannelPushEntryMsg`;

  const routing = {
    meetingId: sessionVariables['x-hasura-meetingid'] as String,
    userId: sessionVariables['x-hasura-userid'] as String
  };

  const header = {
    name: eventName,
    meetingId: routing.meetingId,
    userId: routing.userId
  };

  try {
    JSON.parse(<string>input.payloadJson);
  } catch (e) {
    throw new ValidationError('Field `payloadJson` contains an invalid Json.', 400);
  }

  const body = {
    pluginName: input.pluginName,
    channelName: input.channelName,
    subChannelName: input.subChannelName,
    payloadJson: input.payloadJson,
    toRoles: input.toRoles,
    toUserIds: input.toUserIds
  };

  return { eventName, routing, header, body };
}

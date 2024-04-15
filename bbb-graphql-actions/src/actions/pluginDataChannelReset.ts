import { RedisMessage } from '../types';

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  const eventName = `PluginDataChannelResetMsg`;

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
    pluginName: input.pluginName,
    channelName: input.channelName,
    subChannelName: input.subChannelName
  };

  return { eventName, routing, header, body };
}

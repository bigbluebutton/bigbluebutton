import { RedisMessage } from '../types';

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  const eventName = `DispatchPluginDataChannelMessageMsg`;

  const routing = {
    meetingId: sessionVariables['x-hasura-meetingid'] as String,
    userId: sessionVariables['x-hasura-userid'] as String
  };

  const header = {
    name: eventName,
    meetingId: routing.meetingId,
    userId: routing.userId
  };

  //Validate if payloadJson is a valid Json

  const body = {
    pluginName: input.pluginName,
    dataChannel: input.dataChannel,
    payloadJson: input.payloadJson,
    toRoles: input.toRoles,
    toUserIds: input.toUserIds
  };

  return { eventName, routing, header, body };
}

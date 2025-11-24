import { gql } from '@apollo/client';

export const PLUGIN_DATA_CHANNEL_PRIVATE_SUBSCRIPTION = gql`
  subscription FetchPluginDataChannelEntry {
    pluginDataChannelEntry_private (
      order_by: {createdAt: desc}
    ) {
      createdAt,
      updatedAt,
      channelName,
      subChannelName,
      entryId,
      payloadJson,
      createdBy,
      pluginName,
      toRoles,
    }
  }
`;

export const PLUGIN_DATA_CHANNEL_PUBLIC_SUBSCRIPTION = gql`
  subscription FetchPluginDataChannelPublicEntry {
    pluginDataChannelEntry_public (
      order_by: {createdAt: desc}
    ) {
      createdAt,
      updatedAt,
      channelName,
      subChannelName,
      entryId,
      payloadJson,
      createdBy,
      pluginName,
    }
  }
`;

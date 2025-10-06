import { gql } from '@apollo/client';

const PLUGIN_DATA_CHANNEL_SUBSCRIPTION = gql`
  subscription FetchPluginDataChannelEntry {
    pluginDataChannelEntry (
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

export default PLUGIN_DATA_CHANNEL_SUBSCRIPTION;

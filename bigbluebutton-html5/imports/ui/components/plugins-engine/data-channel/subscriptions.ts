import { gql } from '@apollo/client';

const PLUGIN_DATA_CHANNEL_NEW_ITEMS = gql`
  subscription FetchPluginDataChannelEntry($pluginName: String!,
    $channelName: String! , $createdAt: timestamptz!, $subChannelName: String!){
    pluginDataChannelEntry_stream(
      cursor: {initial_value: {createdAt: $createdAt}}, batch_size: 100,
      where: {
        pluginName: { _eq: $pluginName }
        channelName: { _eq: $channelName }
        subChannelName: { _eq: $subChannelName }
      }
    ) {
      createdAt,
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

const PLUGIN_DATA_CHANNEL_ALL_ITEMS = gql`
  subscription FetchPluginDataChannelEntry($pluginName: String!,
    $channelName: String!, $subChannelName: String!
  ){
    pluginDataChannelEntry(
      order_by: {createdAt: desc},
      where: {
        pluginName: { _eq: $pluginName }
        channelName: { _eq: $channelName }
        subChannelName: { _eq: $subChannelName }
      }
    ) {
      createdAt,
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

const PLUGIN_DATA_CHANNEL_LATEST_ITEM = gql`
  subscription FetchPluginDataChannelEntry($pluginName: String!,
    $channelName: String!, $subChannelName: String!
  ){
    pluginDataChannelEntry(
      order_by: {createdAt: desc},
      limit: 1,
      where: {
        pluginName: { _eq: $pluginName }
        channelName: { _eq: $channelName }
        subChannelName: { _eq: $subChannelName }
      }
    ) {
      createdAt,
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

export { PLUGIN_DATA_CHANNEL_LATEST_ITEM, PLUGIN_DATA_CHANNEL_NEW_ITEMS, PLUGIN_DATA_CHANNEL_ALL_ITEMS };

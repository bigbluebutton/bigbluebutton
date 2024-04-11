import { gql } from '@apollo/client';

const PLUGIN_DATA_CHANNEL_NEW_ITEMS = gql`
  subscription FetchPluginDataChannelMessageMsg($pluginName: String!,
    $channelName: String! , $createdAt: timestamptz!, $subChannelName: String!){
    pluginDataChannelMessage_stream(
      cursor: {initial_value: {createdAt: $createdAt}}, batch_size: 100,
      where: {
        pluginName: { _eq: $pluginName }
        dataChannel: { _eq: $channelName }
        subChannelName: { _eq: $subChannelName }
      }
    ) {
      createdAt,
      dataChannel,
      subChannelName,
      messageId,
      payloadJson,
      fromUserId,
      pluginName,
      toRoles,
    }
  }
`;

const PLUGIN_DATA_CHANNEL_All_ITEMS = gql`
  subscription FetchPluginDataChannelMessageMsg($pluginName: String!,
    $channelName: String!, $subChannelName: String!
  ){
    pluginDataChannelMessage(
      order_by: {createdAt: desc},
      where: {
        pluginName: { _eq: $pluginName }
        dataChannel: { _eq: $channelName }
        subChannelName: { _eq: $subChannelName }
      }
    ) {
      createdAt,
      dataChannel,
      subChannelName,
      messageId,
      payloadJson,
      fromUserId,
      pluginName,
      toRoles,
    }
  }
`;

const PLUGIN_DATA_CHANNEL_LATEST_ITEM = gql`
  subscription FetchPluginDataChannelMessageMsg($pluginName: String!,
    $channelName: String!, $subChannelName: String!
  ){
    pluginDataChannelMessage(
      order_by: {createdAt: desc},
      limit: 1,
      where: {
        pluginName: { _eq: $pluginName }
        dataChannel: { _eq: $channelName }
        subChannelName: { _eq: $subChannelName }
      }
    ) {
      createdAt,
      dataChannel,
      subChannelName,
      messageId,
      payloadJson,
      fromUserId,
      pluginName,
      toRoles,
    }
  }
`;

export { PLUGIN_DATA_CHANNEL_LATEST_ITEM, PLUGIN_DATA_CHANNEL_NEW_ITEMS, PLUGIN_DATA_CHANNEL_All_ITEMS };

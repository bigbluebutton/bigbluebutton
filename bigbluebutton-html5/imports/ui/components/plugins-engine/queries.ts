import { gql } from '@apollo/client';

const PLUGIN_DATA_CHANNEL_DISPATCH_QUERY = gql`
  mutation DispatchPluginDataChannelMessageMsg($pluginName: String!,
    $dataChannel: String!, $payloadJson: String!, $toRoles: [String]!, $toUserIds: [String]!) {
    dispatchPluginDataChannelMessageMsg(
      pluginName: $pluginName,
      dataChannel: $dataChannel,
      payloadJson: $payloadJson,
      toRoles: $toRoles,
      toUserIds: $toUserIds,
    )
  }
`;

const PLUGIN_DATA_CHANNEL_FETCH_QUERY = gql`
  subscription FetchPluginDataChannelMessageMsg($pluginName: String!, $channelName: String!){
    pluginDataChannelMessage(
      order_by: {createdAt: asc},
      where: {
        pluginName: { _eq: $pluginName }
        dataChannel: { _eq: $channelName }
      }
    ) {
      createdAt,
      dataChannel,
      messageId,
      payloadJson,
      fromUserId,
      pluginName,
      toRoles,
    }
  }
`;

export { PLUGIN_DATA_CHANNEL_DISPATCH_QUERY, PLUGIN_DATA_CHANNEL_FETCH_QUERY };

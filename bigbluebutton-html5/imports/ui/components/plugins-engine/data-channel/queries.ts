import { gql } from '@apollo/client';

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

export default PLUGIN_DATA_CHANNEL_FETCH_QUERY;

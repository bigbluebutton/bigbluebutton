import { gql } from '@apollo/client';

export const PLUGIN_DATA_CHANNEL_DISPATCH_MUTATION = gql`
  mutation PluginDataChannelDispatchMessage($pluginName: String!, 
    $subChannelName: String!, $dataChannel: String!, $payloadJson: String!,
    $toRoles: [String]!, $toUserIds: [String]!) {
      pluginDataChannelDispatchMessage(
        pluginName: $pluginName,
        dataChannel: $dataChannel,
        subChannelName: $subChannelName,
        payloadJson: $payloadJson,
        toRoles: $toRoles,
        toUserIds: $toUserIds,
      )
    }
`;

export const PLUGIN_DATA_CHANNEL_RESET_MUTATION = gql`
  mutation PluginDataChannelReset($pluginName: String!, $dataChannel: String!, $subChannelName: String!) {
    pluginDataChannelReset(
      pluginName: $pluginName,
      dataChannel: $dataChannel,
      subChannelName: $subChannelName
    )
  }
`;

export const PLUGIN_DATA_CHANNEL_DELETE_MUTATION = gql`
  mutation PluginDataChannelDeleteMessage($pluginName: String!,
    $dataChannel: String!, $messageId: String!, $subChannelName: String!) {
    pluginDataChannelDeleteMessage(
      pluginName: $pluginName,
      dataChannel: $dataChannel,
      messageId: $messageId,
      subChannelName: $subChannelName
    )
  }
`;

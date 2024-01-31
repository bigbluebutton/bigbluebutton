import { gql } from '@apollo/client';

export const PLUGIN_DATA_CHANNEL_DISPATCH_MUTATION = gql`
  mutation PluginDataChannelDispatchMessage($pluginName: String!,
    $dataChannel: String!, $payloadJson: String!, $toRoles: [String]!, 
    $toUserIds: [String]!) {
      pluginDataChannelDispatchMessage(
        pluginName: $pluginName,
        dataChannel: $dataChannel,
        payloadJson: $payloadJson,
        toRoles: $toRoles,
        toUserIds: $toUserIds,
      )
    }
`;

export const PLUGIN_DATA_CHANNEL_RESET_MUTATION = gql`
  mutation PluginDataChannelReset($pluginName: String!, $dataChannel: String!) {
        pluginDataChannelReset(
            pluginName: $pluginName,
            dataChannel: $dataChannel
        )
    }
`;

export const PLUGIN_DATA_CHANNEL_DELETE_MUTATION = gql`
    mutation PluginDataChannelDeleteMessage($pluginName: String!, $dataChannel: String!, $messageId: String!) {
        pluginDataChannelDeleteMessage(
        pluginName: $pluginName,
        dataChannel: $dataChannel,
        messageId: $messageId
        )
    }
`;

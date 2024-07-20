import { gql } from '@apollo/client';

export const PLUGIN_DATA_CHANNEL_PUSH_MUTATION = gql`
  mutation PluginDataChannelPushEntry($pluginName: String!,
    $subChannelName: String!, $channelName: String!,
    $payloadJson: json!,
    $toRoles: [String]!, $toUserIds: [String]!) {
      pluginDataChannelPushEntry(
        pluginName: $pluginName,
        channelName: $channelName,
        subChannelName: $subChannelName,
        payloadJson: $payloadJson,
        toRoles: $toRoles,
        toUserIds: $toUserIds,
      )
    }
`;

export const PLUGIN_DATA_CHANNEL_RESET_MUTATION = gql`
  mutation PluginDataChannelReset($pluginName: String!, $channelName: String!, $subChannelName: String!) {
    pluginDataChannelReset(
      pluginName: $pluginName,
      channelName: $channelName,
      subChannelName: $subChannelName
    )
  }
`;

export const PLUGIN_DATA_CHANNEL_DELETE_MUTATION = gql`
  mutation PluginDataChannelDeleteEntry($pluginName: String!,
    $channelName: String!, $entryId: String!, $subChannelName: String!) {
    pluginDataChannelDeleteEntry(
      pluginName: $pluginName,
      channelName: $channelName,
      entryId: $entryId,
      subChannelName: $subChannelName
    )
  }
`;

export const PLUGIN_DATA_CHANNEL_REPLACE_MUTATION = gql`
  mutation PluginDataChannelReplaceEntry($pluginName: String!, 
    $subChannelName: String!, $channelName: String!, 
    $payloadJson: json!, $entryId: String!) {
      pluginDataChannelReplaceEntry(
        entryId: $entryId,
        pluginName: $pluginName,
        channelName: $channelName,
        subChannelName: $subChannelName,
        payloadJson: $payloadJson
      )
    }
`;

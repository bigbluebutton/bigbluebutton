import { gql } from '@apollo/client';

const PLUGIN_EVENT_PERSISTENCE_MUTATION = gql`
  mutation PluginPersistEvent($pluginName: String!,
    $eventName: String!, $payloadJson: json!) {
      pluginPersistEvent(
        payloadJson: $payloadJson,
        eventName: $eventName,
        pluginName: $pluginName,
      )
    }
`;

export default PLUGIN_EVENT_PERSISTENCE_MUTATION;

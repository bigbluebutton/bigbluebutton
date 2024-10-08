import { gql } from '@apollo/client';

const PLUGIN_EVENT_PERSISTENCE_MUTATION = gql`
  mutation PluginPersistEvent($pluginName: String!,
    $eventName: String!, $payload: json!) {
      pluginPersistEvent(
        payload: $payload,
        eventName: $eventName,
        pluginName: $pluginName,
      )
    }
`;

export default PLUGIN_EVENT_PERSISTENCE_MUTATION;

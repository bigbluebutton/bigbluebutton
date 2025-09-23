import { gql } from '@apollo/client';

const PLUGIN_CONFIGURATION_QUERY = gql`subscription PluginConfiguration {
  plugin {
    javascriptEntrypointIntegrity
    javascriptEntrypointUrl
    loadFailureReason
    loadFailureSource
    localesBaseUrl
    name
  }
}`;

export default PLUGIN_CONFIGURATION_QUERY;

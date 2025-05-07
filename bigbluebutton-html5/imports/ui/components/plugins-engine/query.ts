import { gql } from '@apollo/client';

const PLUGIN_CONFIGURATION_QUERY = gql`query PluginConfigurationQuery {
  plugin {
    name,
    javascriptEntrypointUrl,
    javascriptEntrypointIntegrity,
    localesBaseUrl,
  }  
}`;

export default PLUGIN_CONFIGURATION_QUERY;

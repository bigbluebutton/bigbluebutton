import { gql } from '@apollo/client';

const PLUGIN_CONFIGURATION_QUERY = gql`query PluginConfigurationQuery {
  plugin {
    name,
    javascriptEntrypointUrl,
    pluginJavascriptChecksum,
  }  
}`;

export default PLUGIN_CONFIGURATION_QUERY;

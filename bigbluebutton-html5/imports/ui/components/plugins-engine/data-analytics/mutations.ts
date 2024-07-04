import { gql } from '@apollo/client';

const PLUGIN_DATA_ANALYTICS_SEND_MUTATION = gql`
  mutation PluginDataAnalyticsSendObject($pluginName: String!,
    $dataAnalyticsObject: json!) {
      pluginDataAnalyticsSendObject(
        dataAnalyticsObject: $dataAnalyticsObject,
        pluginName: $pluginName,
      )
    }
`;

export default PLUGIN_DATA_ANALYTICS_SEND_MUTATION;

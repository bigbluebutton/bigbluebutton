import { gql } from '@apollo/client';

const PLUGIN_LEARNING_ANALYTICS_DASHBOARD_SEND_GENERIC_DATA_MUTATION = gql`
  mutation PluginLearningAnalyticsDashboardSendGenericData($pluginName: String!,
    $genericDataForLearningAnalyticsDashboard: json!) {
      pluginLearningAnalyticsDashboardSendGenericData(
        genericDataForLearningAnalyticsDashboard: $genericDataForLearningAnalyticsDashboard,
        pluginName: $pluginName,
      )
    }
`;

export default PLUGIN_LEARNING_ANALYTICS_DASHBOARD_SEND_GENERIC_DATA_MUTATION;

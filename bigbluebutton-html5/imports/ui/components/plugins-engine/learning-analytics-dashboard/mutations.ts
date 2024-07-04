import { gql } from '@apollo/client';

const PLUGIN_LEARNING_ANALYTICS_DASHBOARD_SEND_DATA_MUTATION = gql`
  mutation PluginLearningAnalyticsDashboardSendData($pluginName: String!,
    $genericDataForLearningAnalyticsDashboard: json!) {
      pluginLearningAnalyticsDashboardSendData(
        genericDataForLearningAnalyticsDashboard: $genericDataForLearningAnalyticsDashboard,
        pluginName: $pluginName,
      )
    }
`;

export default PLUGIN_LEARNING_ANALYTICS_DASHBOARD_SEND_DATA_MUTATION;

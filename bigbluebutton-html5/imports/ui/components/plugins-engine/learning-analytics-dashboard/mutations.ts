import { gql } from '@apollo/client';

const PLUGIN_LEARNING_ANALYTICS_DASHBOARD_SEND_MUTATION = gql`
  mutation PluginLearningAnalyticsDashboardSend($pluginName: String!,
    $genericDataForLearningAnalyticsDashboard: json!) {
      pluginLearningAnalyticsDashboardSend(
        genericDataForLearningAnalyticsDashboard: $genericDataForLearningAnalyticsDashboard,
        pluginName: $pluginName,
      )
    }
`;

export default PLUGIN_LEARNING_ANALYTICS_DASHBOARD_SEND_MUTATION;

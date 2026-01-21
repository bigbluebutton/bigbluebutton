import { gql } from '@apollo/client';

export const PLUGIN_LEARNING_ANALYTICS_DASHBOARD_UPSERT_USER_DATA_MUTATION = gql`
  mutation PluginLearningAnalyticsDashboardUpsertUserData($pluginName: String!,
    $userDataForLearningAnalyticsDashboard: json!, $targetUserId: String!) {
      pluginLearningAnalyticsDashboardUpsertUserData(
        userDataForLearningAnalyticsDashboard: $userDataForLearningAnalyticsDashboard,
        pluginName: $pluginName, targetUserId: $targetUserId
      )
    }
`;

export const PLUGIN_LEARNING_ANALYTICS_DASHBOARD_DELETE_USER_DATA_MUTATION = gql`
  mutation PluginLearningAnalyticsDashboardDeleteUserData($pluginName: String!,
    $userDataForLearningAnalyticsDashboard: json!, $targetUserId: String!) {
      pluginLearningAnalyticsDashboardDeleteUserData(
        userDataForLearningAnalyticsDashboard: $userDataForLearningAnalyticsDashboard,
        pluginName: $pluginName, targetUserId: $targetUserId
      )
    }
`;

export const PLUGIN_LEARNING_ANALYTICS_DASHBOARD_CLEAR_ALL_USER_DATA_MUTATION = gql`
  mutation PluginLearningAnalyticsDashboardClearAllUsersData($pluginName: String!,
    $cardTitle: String!) {
      pluginLearningAnalyticsDashboardClearAllUsersData(
        cardTitle: $cardTitle, pluginName: $pluginName
      )
    }
`;

import { PluginLearningAnalyticsDashboardManagerProps } from './types';
import { useHandleClearAllUsersData, useHandleDeleteUserData, useHandleUpsertUserData } from './hooks';

const PluginLearningAnalyticsDashboardManager: React.ElementType<
  PluginLearningAnalyticsDashboardManagerProps> = ((
    props: PluginLearningAnalyticsDashboardManagerProps,
  ) => {
    const { pluginName } = props;

    useHandleUpsertUserData(pluginName);
    useHandleDeleteUserData(pluginName);
    useHandleClearAllUsersData(pluginName);
  }) as React.ElementType<PluginLearningAnalyticsDashboardManagerProps>;

export default PluginLearningAnalyticsDashboardManager;

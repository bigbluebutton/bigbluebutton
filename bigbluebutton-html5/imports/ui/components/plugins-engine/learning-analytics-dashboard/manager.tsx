import { useEffect } from 'react';
import { LearningAnalyticsDashboardEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/learning-analytics-dashboard/types';
import { LearningAnalyticsDashboardEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/learning-analytics-dashboard/enums';
import { useMutation } from '@apollo/client';
import PLUGIN_LEARNING_ANALYTICS_DASHBOARD_SEND_GENERIC_DATA_MUTATION from './mutations';
import { PluginLearningAnalyticsDashboardManagerProps } from './types';

const PluginLearningAnalyticsDashboardManager: React.ElementType<
  PluginLearningAnalyticsDashboardManagerProps> = ((
    props: PluginLearningAnalyticsDashboardManagerProps,
  ) => {
    const { pluginName } = props;

    const [sendGenericDataToLearningAnalyticsDashboard] = useMutation(
      PLUGIN_LEARNING_ANALYTICS_DASHBOARD_SEND_GENERIC_DATA_MUTATION,
    );

    const handleSendGenericDataForLearningAnalyticsDashboard: EventListener = (
    (event: CustomEvent<LearningAnalyticsDashboardEventDetails>) => {
      if (event.detail.pluginName === pluginName) {
        const eventDetails = event.detail as LearningAnalyticsDashboardEventDetails;
        sendGenericDataToLearningAnalyticsDashboard({
          variables: {
            pluginName: eventDetails.pluginName,
            genericDataForLearningAnalyticsDashboard: eventDetails.data,
          },
        });
      }
    }) as EventListener;

    useEffect(() => {
      window.addEventListener(
        LearningAnalyticsDashboardEvents.GENERIC_DATA_SENT, handleSendGenericDataForLearningAnalyticsDashboard,
      );
      return () => {
        window.removeEventListener(
          LearningAnalyticsDashboardEvents.GENERIC_DATA_SENT, handleSendGenericDataForLearningAnalyticsDashboard,
        );
      };
    }, []);
  }) as React.ElementType<PluginLearningAnalyticsDashboardManagerProps>;

export default PluginLearningAnalyticsDashboardManager;

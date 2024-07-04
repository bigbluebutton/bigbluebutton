import { useEffect } from 'react';
import { DataAnalyticsEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-analytics/types';
import { DataAnalyticsSendObjectEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-analytics/enums';
import { useMutation } from '@apollo/client';
import PLUGIN_DATA_ANALYTICS_SEND_MUTATION from './mutations';
import { PluginDataAnalyticsManagerProps } from './types';

const PluginDataAnalyticsManager: React.ElementType<PluginDataAnalyticsManagerProps> = ((
  props: PluginDataAnalyticsManagerProps,
) => {
  const { pluginName } = props;

  const [sendDataAnalyticsObject] = useMutation(PLUGIN_DATA_ANALYTICS_SEND_MUTATION);

  const sendDataAnalytics: EventListener = (
    (event: CustomEvent<DataAnalyticsEventDetails>) => {
      if (event.detail.pluginName === pluginName) {
        const eventDetails = event.detail as DataAnalyticsEventDetails;
        sendDataAnalyticsObject({
          variables: {
            pluginName: eventDetails.pluginName,
            dataAnalyticsObject: eventDetails.dataAnalyticsObject,
          },
        });
      }
    }) as EventListener;

  useEffect(() => {
    window.addEventListener(DataAnalyticsSendObjectEvents.SEND_DATA_ANALYTICS_OBJECT, sendDataAnalytics);
    return () => {
      window.removeEventListener(DataAnalyticsSendObjectEvents.SEND_DATA_ANALYTICS_OBJECT, sendDataAnalytics);
    };
  }, []);
}) as React.ElementType<PluginDataAnalyticsManagerProps>;

export default PluginDataAnalyticsManager;

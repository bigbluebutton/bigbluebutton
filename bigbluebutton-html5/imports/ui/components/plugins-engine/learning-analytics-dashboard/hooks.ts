import { useEffect } from 'react';
import {
  ClearLearningAnalyticsDashboardEventDetails,
  LearningAnalyticsDashboardDeleteUserData,
  LearningAnalyticsDashboardEventDetails,
  LearningAnalyticsDashboardUserData,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/learning-analytics-dashboard/types';
import { LearningAnalyticsDashboardEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/learning-analytics-dashboard/enums';
import { useMutation } from '@apollo/client';
import {
  PLUGIN_LEARNING_ANALYTICS_DASHBOARD_UPSERT_USER_DATA_MUTATION,
  PLUGIN_LEARNING_ANALYTICS_DASHBOARD_DELETE_USER_DATA_MUTATION,
  PLUGIN_LEARNING_ANALYTICS_DASHBOARD_CLEAR_ALL_USER_DATA_MUTATION,
} from './mutations';

function useListenToEvent(
  event: LearningAnalyticsDashboardEvents,
  handler: EventListener,
) {
  useEffect(() => {
    window.addEventListener(
      event,
      handler,
    );
    return () => {
      window.removeEventListener(
        event,
        handler,
      );
    };
  }, []);
}

export function useHandleClearAllUsersData(pluginName: string) {
  const [clearAllUsersDataFromLearningAnalyticsDashboard] = useMutation(
    PLUGIN_LEARNING_ANALYTICS_DASHBOARD_CLEAR_ALL_USER_DATA_MUTATION,
  );
  const handleClearAllUsersDataFromLearningAnalyticsDashboard: EventListener = (
    (event: CustomEvent<ClearLearningAnalyticsDashboardEventDetails>) => {
      if (event.detail.pluginName === pluginName) {
        const eventDetails = event.detail as ClearLearningAnalyticsDashboardEventDetails;
        const cardTitle = eventDetails.cardTitle || '';
        clearAllUsersDataFromLearningAnalyticsDashboard({
          variables: {
            pluginName: eventDetails.pluginName,
            cardTitle,
          },
        });
      }
    }) as EventListener;
  useListenToEvent(
    LearningAnalyticsDashboardEvents.CLEAR_ALL_USERS_DATA_COMMAND_SENT,
    handleClearAllUsersDataFromLearningAnalyticsDashboard,
  );
}

export function useHandleUpsertUserData(pluginName: string) {
  const [upsertUserDataToLearningAnalyticsDashboard] = useMutation(
    PLUGIN_LEARNING_ANALYTICS_DASHBOARD_UPSERT_USER_DATA_MUTATION,
  );

  // This flow will be deprecated
  const handleSendDataForLearningAnalyticsDashboard: EventListener = (
    (event: CustomEvent<LearningAnalyticsDashboardEventDetails>) => {
      if (event.detail.pluginName === pluginName) {
        const eventDetails = event.detail as LearningAnalyticsDashboardEventDetails;
        upsertUserDataToLearningAnalyticsDashboard({
          variables: {
            pluginName: eventDetails.pluginName,
            userDataForLearningAnalyticsDashboard: eventDetails.data,
            targetUserId: '',
          },
        });
      }
    }) as EventListener;

  const handleUpsertUserDataForLearningAnalyticsDashboard: EventListener = (
    (event: CustomEvent<LearningAnalyticsDashboardEventDetails>) => {
      if (event.detail.pluginName === pluginName) {
        const eventDetails = event.detail as LearningAnalyticsDashboardEventDetails;
        const dataToBeSent = eventDetails.data as LearningAnalyticsDashboardUserData;
        const targetUserId = eventDetails.targetUserId || '';
        upsertUserDataToLearningAnalyticsDashboard({
          variables: {
            pluginName: eventDetails.pluginName,
            userDataForLearningAnalyticsDashboard: dataToBeSent,
            targetUserId,
          },
        });
      }
    }) as EventListener;

  useListenToEvent(
    LearningAnalyticsDashboardEvents.UPSERT_USER_DATA_COMMAND_SENT,
    handleUpsertUserDataForLearningAnalyticsDashboard,
  );
  useListenToEvent(
    LearningAnalyticsDashboardEvents.GENERIC_DATA_SENT,
    handleSendDataForLearningAnalyticsDashboard,
  );
}

export function useHandleDeleteUserData(pluginName: string) {
  const [deleteUserDataFromLearningAnalyticsDashboard] = useMutation(
    PLUGIN_LEARNING_ANALYTICS_DASHBOARD_DELETE_USER_DATA_MUTATION,
  );

  const handleDeleteUserDataFromLearningAnalyticsDashboard: EventListener = (
  (event: CustomEvent<LearningAnalyticsDashboardEventDetails>) => {
    if (event.detail.pluginName === pluginName) {
      const eventDetails = event.detail as LearningAnalyticsDashboardEventDetails;
      const dataToBeSent = eventDetails.data as LearningAnalyticsDashboardDeleteUserData;
      const targetUserId = eventDetails.targetUserId || '';
      deleteUserDataFromLearningAnalyticsDashboard({
        variables: {
          pluginName: eventDetails.pluginName,
          userDataForLearningAnalyticsDashboard: dataToBeSent,
          targetUserId,
        },
      });
    }
  }) as EventListener;

  useListenToEvent(
    LearningAnalyticsDashboardEvents.DELETE_USER_DATA_COMMAND_SENT,
    handleDeleteUserDataFromLearningAnalyticsDashboard,
  );
}

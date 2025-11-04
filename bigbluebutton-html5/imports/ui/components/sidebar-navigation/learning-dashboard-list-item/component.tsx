import React, { useCallback, memo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import LearningDashboardService from '/imports/ui/components/learning-dashboard/service';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import SidebarNavigationButton from '/imports/ui/components/sidebar-navigation/sidebar-navigation-button/component';

const intlMessages = defineMessages({
  learningDashboardLabel: {
    id: 'app.userList.learningDashboardLabel',
    description: 'Title for the learning dashboard',
  },
});

const LearningDashboardListItem = () => {
  const intl = useIntl();
  const { data: meetingInfo } = useMeeting((meeting) => ({
    learningDashboardAccessToken: meeting.learningDashboardAccessToken,
    isBreakout: meeting?.isBreakout,
  }));

  const openLearningDashboardPanel = useCallback(() => {
    LearningDashboardService.openLearningDashboardUrl(intl.locale, meetingInfo?.learningDashboardAccessToken);
  }, [intl, meetingInfo]);

  const label = intl.formatMessage(intlMessages.learningDashboardLabel);

  if (meetingInfo?.isBreakout) return null;

  return (
    <SidebarNavigationButton
      iconName="learning_dashboard"
      label={label}
      id="learning-dashboard-toggle-button"
      ariaDescribedBy="learningDashboard"
      dataTest="learningDashboardSidebarButton"
      onClick={openLearningDashboardPanel}
    />
  );
};

export default memo(LearningDashboardListItem);

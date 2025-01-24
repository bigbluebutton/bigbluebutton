import React, { useCallback } from 'react';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import { defineMessages, useIntl } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/component';
import LearningDashboardService from '/imports/ui/components/learning-dashboard/service';
import Styled from '../styles';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { Meeting } from '/imports/ui/Types/meeting';

const intlMessages = defineMessages({
  learningDashboardLabel: {
    id: 'app.userList.learningDashboardLabel',
    description: 'Title for the learning dashboard',
  },
});

const LearningDashboardListItem = () => {
  const intl = useIntl();
  const { data: meetingInfo } = useMeeting((meeting: Partial<Meeting>) => ({
    learningDashboardAccessToken: meeting.learningDashboardAccessToken,
    isBreakout: meeting?.isBreakout,
  }));

  const toggleLearningDashboardPanel = useCallback(() => {
    LearningDashboardService.openLearningDashboardUrl(intl.locale, meetingInfo?.learningDashboardAccessToken);
  }, [intl, meetingInfo]);

  const label = intl.formatMessage(intlMessages.learningDashboardLabel);

  if (meetingInfo?.isBreakout) return null;

  return (
    <TooltipContainer
      title={label}
      position="right"
    >
      <Styled.ListItem
        id="learning-dashboard-toggle-button"
        aria-label={label}
        aria-describedby="learningDashboard"
        active={false}
        role="button"
        tabIndex={0}
        data-test="learningDashboardSidebarButton"
        onClick={toggleLearningDashboardPanel}
        // @ts-ignore
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            toggleLearningDashboardPanel();
          }
        }}
      >
        <Icon iconName="learning_dashboard" />
      </Styled.ListItem>
    </TooltipContainer>
  );
};

export default LearningDashboardListItem;

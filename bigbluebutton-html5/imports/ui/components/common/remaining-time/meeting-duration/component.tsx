import React from 'react';
import RemainingTime from '/imports/ui/components/common/remaining-time/component';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { defineMessages, useIntl } from 'react-intl';

const intlMessages = defineMessages({
  calculatingBreakoutTimeRemaining: {
    id: 'app.calculatingBreakoutTimeRemaining',
    description: 'Message that tells that the remaining time is being calculated',
  },
  meetingTimeRemaining: {
    id: 'app.meeting.meetingTimeRemaining',
    description: 'Message that tells how much time is remaining for the meeting',
  },
  meetingWillClose: {
    id: 'app.meeting.meetingTimeHasEnded',
    description: 'Message that tells time has ended and meeting will close',
  },
  breakoutTimeRemaining: {
    id: 'app.breakoutTimeRemainingMessage',
    description: 'Message that tells how much time is remaining for the breakout room',
  },
  breakoutWillClose: {
    id: 'app.breakoutWillCloseMessage',
    description: 'Message that tells time has ended and breakout will close',
  },
  alertBreakoutEndsUnderMinutes: {
    id: 'app.meeting.alertBreakoutEndsUnderMinutes',
    description: 'Alert that tells that the breakout ends under x minutes',
  },
  alertMeetingEndsUnderMinutes: {
    id: 'app.meeting.alertMeetingEndsUnderMinutes',
    description: 'Alert that tells that the meeting ends under x minutes',
  },
});

const MeetingRemainingTimeContainer: React.FC = () => {
  const intl = useIntl();
  const loadingRemainingTime = () => {
    return (
      <span>
        {intl.formatMessage(intlMessages.calculatingBreakoutTimeRemaining)}
      </span>
    );
  };
  const {
    data: currentMeeting,
  } = useMeeting((m) => {
    return {
      isBreakout: m.isBreakout,
      durationInSeconds: m.durationInSeconds,
      createdTime: m.createdTime,
    };
  });

  if (!currentMeeting) return loadingRemainingTime();

  const meetingDurationInSeconds: number = currentMeeting.durationInSeconds ?? 0;
  const meetingCreatedTime: number = currentMeeting.createdTime ?? 0;
  const { isBreakout } = currentMeeting;

  const durationLabel = isBreakout
    ? intlMessages.breakoutTimeRemaining
    : intlMessages.meetingTimeRemaining;

  const endingLabel = isBreakout
    ? intlMessages.breakoutWillClose
    : intlMessages.meetingWillClose;

  const alertLabel = isBreakout
    ? intlMessages.alertBreakoutEndsUnderMinutes
    : intlMessages.alertMeetingEndsUnderMinutes;

  return (
    <RemainingTime
      durationInSeconds={meetingDurationInSeconds}
      referenceStartedTime={meetingCreatedTime}
      durationLabel={durationLabel}
      endingLabel={endingLabel}
      isBreakout={!!isBreakout}
      alertLabel={alertLabel}
      boldText={false}
    />
  );
};

export default MeetingRemainingTimeContainer;

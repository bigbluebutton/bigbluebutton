import { withTracker } from 'meteor/react-meteor-data';
import React, { useEffect } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';
import { isEmpty } from 'radash';
import MeetingRemainingTime from '/imports/ui/components/common/remaining-time/meeting-duration/component';
import { layoutSelectInput, layoutDispatch } from '../layout/context';
import { ACTIONS } from '../layout/enums';

import NotificationsBar from './component';

// disconnected and trying to open a new connection
const intlMessages = defineMessages({
  failedMessage: {
    id: 'app.failedMessage',
    description: 'Notification for connecting to server problems',
  },
  connectingMessage: {
    id: 'app.connectingMessage',
    description: 'Notification message for when client is connecting to server',
  },
  waitingMessage: {
    id: 'app.waitingMessage',
    description: 'Notification message for disconnection with reconnection counter',
  },
  reconnectingMessage: {
    id: 'app.reconnectingMessage',
    description: 'Notification message for disconnection',
  },
  calculatingBreakoutTimeRemaining: {
    id: 'app.calculatingBreakoutTimeRemaining',
    description: 'Message that tells that the remaining time is being calculated',
  },
  alertMeetingEndsUnderMinutes: {
    id: 'app.meeting.alertMeetingEndsUnderMinutes',
    description: 'Alert that tells that the meeting ends under x minutes',
  },
  alertBreakoutEndsUnderMinutes: {
    id: 'app.meeting.alertBreakoutEndsUnderMinutes',
    description: 'Alert that tells that the breakout ends under x minutes',
  },
});

const NotificationsBarContainer = (props) => {
  const { message, color } = props;

  const notificationsBar = layoutSelectInput((i) => i.notificationsBar);
  const layoutContextDispatch = layoutDispatch();

  const { hasNotification } = notificationsBar;

  useEffect(() => {
    const localHasNotification = !!message;

    if (localHasNotification !== hasNotification) {
      layoutContextDispatch({
        type: ACTIONS.SET_HAS_NOTIFICATIONS_BAR,
        value: localHasNotification,
      });
    }
  }, [message, hasNotification]);

  if (isEmpty(message)) {
    return null;
  }

  return (
    <NotificationsBar color={color}>
      {message}
    </NotificationsBar>
  );
};

export default injectIntl(withTracker(({ intl, connected }) => {
  const data = {};
  // if connection failed x attempts a error will be thrown
  if (!connected) {
    data.color = 'primary';
    data.message = (
      <>
        {intl.formatMessage(intlMessages.reconnectingMessage)}
      </>
    );
    return data;
  }

  const meetingId = Auth.meetingID;

  const Meeting = Meetings.findOne({ meetingId },
    { fields: { isBreakout: 1, componentsFlags: 1 } });

  if (Meeting.isBreakout) {
    data.message = (
      <MeetingRemainingTime />
    );
  }

  if (Meeting) {
    const { isBreakout, componentsFlags } = Meeting;

    if (componentsFlags.showRemainingTime && !isBreakout) {
      data.message = (
        <MeetingRemainingTime />
      );
    }
  }

  data.alert = true;
  data.color = 'primary';
  return data;
})(NotificationsBarContainer));

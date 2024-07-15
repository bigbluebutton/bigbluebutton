import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { isEmpty } from 'radash';
import MeetingRemainingTime from '/imports/ui/components/common/remaining-time/meeting-duration/component';
import { useReactiveVar } from '@apollo/client';
import { layoutSelectInput, layoutDispatch } from '../layout/context';
import { ACTIONS } from '../layout/enums';

import NotificationsBar from './component';
import connectionStatus from '../../core/graphql/singletons/connectionStatus';
import useMeeting from '../../core/hooks/useMeeting';

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
  serverIsNotResponding: {
    id: 'app.serverIsNotResponding',
    description: 'Alert that tells that server is not responding',
  },
  serverIsSlow: {
    id: 'app.serverIsSlow',
    description: 'Alert that tells that server is slow',
  },
});

const NotificationsBarContainer = () => {
  const data = {};
  data.alert = true;
  data.color = 'primary';
  const intl = useIntl();
  const connected = useReactiveVar(connectionStatus.getConnectedStatusVar());
  const serverIsResponding = useReactiveVar(connectionStatus.getServerIsRespondingVar());
  const pingIsComing = useReactiveVar(connectionStatus.getPingIsComingVar());
  const lastRttRequestSuccess = useReactiveVar(connectionStatus.getLastRttRequestSuccessVar());
  // if connection failed x attempts a error will be thrown
  if (
    !connected
    || !serverIsResponding
    || !pingIsComing
  ) {
    data.color = 'primary';
    data.message = (
      <>
        {!connected && intl.formatMessage(intlMessages.reconnectingMessage)}
        {(connected && !serverIsResponding && lastRttRequestSuccess)
          && intl.formatMessage(intlMessages.serverIsNotResponding)}
        {(connected && serverIsResponding && !pingIsComing && lastRttRequestSuccess)
          && intl.formatMessage(intlMessages.serverIsSlow)}
      </>
    );
  }

  const { data: meeting } = useMeeting((m) => ({
    isBreakout: m.isBreakout,
    componentsFlags: m.componentsFlags,
  }));

  if (meeting?.isBreakout) {
    data.message = (
      <MeetingRemainingTime />
    );
  }

  if (meeting) {
    const { isBreakout, componentsFlags } = meeting;

    if (componentsFlags.showRemainingTime && !isBreakout) {
      data.message = (
        <MeetingRemainingTime />
      );
    }
  }

  const notificationsBar = layoutSelectInput((i) => i.notificationsBar);
  const layoutContextDispatch = layoutDispatch();

  const { hasNotification } = notificationsBar;

  useEffect(() => {
    const localHasNotification = !!data.message;

    if (localHasNotification !== hasNotification) {
      layoutContextDispatch({
        type: ACTIONS.SET_HAS_NOTIFICATIONS_BAR,
        value: localHasNotification,
      });
    }
  }, [data.message, hasNotification]);

  if (isEmpty(data.message)) {
    return null;
  }

  return (
    <NotificationsBar color={data.color}>
      {data.message}
    </NotificationsBar>
  );
};

export default NotificationsBarContainer;

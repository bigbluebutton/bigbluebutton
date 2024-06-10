import { withTracker } from 'meteor/react-meteor-data';
import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { makeVar, useReactiveVar } from '@apollo/client';
import { isEmpty } from 'radash';
import MeetingRemainingTime from '/imports/ui/components/common/remaining-time/meeting-duration/component';
import { layoutSelectInput, layoutDispatch } from '../layout/context';
import { ACTIONS } from '../layout/enums';

import NotificationsBar from './component';
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
});

const retrySecondsVar = makeVar(0);
let retryInterval = null;

const getRetrySeconds = () => retrySecondsVar();

const setRetrySeconds = (sec = 0) => {
  if (sec !== retrySecondsVar()) {
    retrySecondsVar(sec);
  }
};

const startCounter = (sec, set, get, interval) => {
  clearInterval(interval);
  set(sec);
  return setInterval(() => {
    set(get() - 1);
  }, 1000);
};

const reconnect = () => {
  Meteor.reconnect();
};

const NotificationsBarContainer = (props) => {
  const {
    connected,
    status,
    retryTime,
  } = props;
  let message;
  let color;

  useReactiveVar(retrySecondsVar);
  const intl = useIntl();
  const { data: meeting } = useMeeting((m) => ({
    isBreakout: m.isBreakout,
    componentsFlags: m.componentsFlags,
  }));

  if (!connected) {
    switch (status) {
      case STATUS_FAILED: {
        color = 'danger';
        message = intl.formatMessage(intlMessages.failedMessage);
        break;
      }
      case STATUS_CONNECTING: {
        message = intl.formatMessage(intlMessages.connectingMessage);
        break;
      }
      case STATUS_WAITING: {
        const sec = Math.round((retryTime - (new Date()).getTime()) / 1000);
        retryInterval = startCounter(sec, setRetrySeconds, getRetrySeconds, retryInterval);
        message = (
          <>
            {intl.formatMessage(intlMessages.waitingMessage, { 0: getRetrySeconds() })}
            <Styled.RetryButton type="button" onClick={reconnect}>
              {intl.formatMessage(intlMessages.retryNow)}
            </Styled.RetryButton>
          </>
        );
        break;
      }
      default:
        color = 'primary';
        break;
    }
  } else {
    color = 'primary';

    if (meeting?.isBreakout) {
      message = (
        <MeetingRemainingTime />
      );
    }

    if (meeting) {
      const { isBreakout, componentsFlags } = meeting;

      if (componentsFlags?.showRemainingTime && !isBreakout) {
        message = (
          <MeetingRemainingTime />
        );
      }
    }
  }

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

export default withTracker(() => Meteor.status())(NotificationsBarContainer);

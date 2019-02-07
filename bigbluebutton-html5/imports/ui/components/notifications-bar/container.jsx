import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';
import NavBarService from '../nav-bar/service';
import BreakoutRemainingTime from '/imports/ui/components/breakout-room/breakout-remaining-time/container';

import NotificationsBar from './component';

// disconnected and trying to open a new connection
const STATUS_CONNECTING = 'connecting';

// permanently failed to connect; e.g., the client and server support different versions of DDP
const STATUS_FAILED = 'failed';

// failed to connect and waiting to try to reconnect
const STATUS_WAITING = 'waiting';

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
  breakoutTimeRemaining: {
    id: 'app.breakoutTimeRemainingMessage',
    description: 'Message that tells how much time is remaining for the breakout room',
  },
  breakoutWillClose: {
    id: 'app.breakoutWillCloseMessage',
    description: 'Message that tells time has ended and breakout will close',
  },
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
  alertMeetingEndsUnderOneMinute: {
    id: 'app.meeting.alertMeetingEndsUnderOneMinute',
    description: 'Alert that tells that the meeting end under a minute',
  },
  alertBreakoutEndsUnderOneMinute: {
    id: 'app.meeting.alertBreakoutEndsUnderOneMinute',
    description: 'Alert that tells that the breakout end under a minute',
  },
});

const NotificationsBarContainer = (props) => {
  if (_.isEmpty(props.message)) {
    return null;
  }

  const { message, color } = props;

  return (
    <NotificationsBar color={color}>
      {message}
    </NotificationsBar>
  );
};

let retrySeconds = 0;
const retrySecondsDep = new Tracker.Dependency();
let retryInterval = null;

const getRetrySeconds = () => {
  retrySecondsDep.depend();
  return retrySeconds;
};

const setRetrySeconds = (sec = 0) => {
  if (sec !== retrySeconds) {
    retrySeconds = sec;
    retrySecondsDep.changed();
  }
};

const startCounter = (sec, set, get, interval) => {
  clearInterval(interval);
  set(sec);
  return setInterval(() => {
    set(get() - 1);
  }, 1000);
};

export default injectIntl(withTracker(({ intl }) => {
  const { status, connected, retryTime } = Meteor.status();
  const data = {};

  if (!connected) {
    data.color = 'primary';
    switch (status) {
      case STATUS_FAILED: {
        data.color = 'danger';
        data.message = intl.formatMessage(intlMessages.failedMessage);
        break;
      }
      case STATUS_CONNECTING: {
        data.message = intl.formatMessage(intlMessages.connectingMessage);
        break;
      }
      case STATUS_WAITING: {
        const sec = Math.round((retryTime - (new Date()).getTime()) / 1000);
        retryInterval = startCounter(sec, setRetrySeconds, getRetrySeconds, retryInterval);
        data.message = intl.formatMessage(
          intlMessages.waitingMessage,
          { 0: getRetrySeconds() },
        );
        break;
      }
      default:
        break;
    }

    return data;
  }

  const meetingId = Auth.meetingID;
  const breakouts = NavBarService.getBreakouts();

  if (breakouts.length > 0) {
    const currentBreakout = breakouts.find(b => b.breakoutId === meetingId);

    if (currentBreakout) {
      data.message = (
        <BreakoutRemainingTime
          breakoutRoom={currentBreakout}
          messageDuration={intlMessages.breakoutTimeRemaining}
          timeEndedMessage={intlMessages.breakoutWillClose}
          alertMessageUnderOneMinute={intl.formatMessage(intlMessages.alertBreakoutEndsUnderOneMinute)}
        />
      );
    }
  }


  const Meeting = Meetings.findOne({ meetingId: Auth.meetingID });

  if (Meeting) {
    const { timeRemaining } = Meeting.durationProps;
    const { isBreakout } = Meeting.meetingProp;
    const underThirtyMin = timeRemaining && timeRemaining <= (30 * 60);

    if (underThirtyMin && !isBreakout) {
      data.message = (
        <BreakoutRemainingTime
          breakoutRoom={Meeting.durationProps}
          messageDuration={intlMessages.meetingTimeRemaining}
          timeEndedMessage={intlMessages.meetingWillClose}
          alertMessageUnderOneMinute={intl.formatMessage(intlMessages.alertMeetingEndsUnderOneMinute)}
        />
      );
    }
  }


  data.color = 'primary';
  return data;
})(NotificationsBarContainer));

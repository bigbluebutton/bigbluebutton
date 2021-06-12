import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React, { Fragment } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import Auth from '/imports/ui/services/auth';
import Meetings, { MeetingTimeRemaining } from '/imports/api/meetings';
import Users from '/imports/api/users';
import BreakoutRemainingTime from '/imports/ui/components/breakout-room/breakout-remaining-time/container';
import SlowConnection from '/imports/ui/components/slow-connection/component';
import { styles } from './styles.scss';

import breakoutService from '/imports/ui/components/breakout-room/service';
import NotificationsBar from './component';

// disconnected and trying to open a new connection
const STATUS_CONNECTING = 'connecting';

// permanently failed to connect; e.g., the client and server support different versions of DDP
const STATUS_FAILED = 'failed';

// failed to connect and waiting to try to reconnect
const STATUS_WAITING = 'waiting';

const METEOR_SETTINGS_APP = Meteor.settings.public.app;

const SLOW_CONNECTIONS_TYPES = METEOR_SETTINGS_APP.effectiveConnection;
const ENABLE_NETWORK_MONITORING = Meteor.settings.public.networkMonitoring.enableNetworkMonitoring;

const HELP_LINK = METEOR_SETTINGS_APP.helpLink;

const REMAINING_TIME_THRESHOLD = METEOR_SETTINGS_APP.remainingTimeThreshold;
const REMAINING_TIME_ALERT_THRESHOLD = METEOR_SETTINGS_APP.remainingTimeAlertThreshold;

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
  retryNow: {
    id: 'app.retryNow',
    description: 'Retry now text for reconnection counter',
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
  alertMeetingEndsUnderMinutes: {
    id: 'app.meeting.alertMeetingEndsUnderMinutes',
    description: 'Alert that tells that the meeting ends under x minutes',
  },
  alertBreakoutEndsUnderMinutes: {
    id: 'app.meeting.alertBreakoutEndsUnderMinutes',
    description: 'Alert that tells that the breakout ends under x minutes',
  },
  slowEffectiveConnectionDetected: {
    id: 'app.network.connection.effective.slow',
    description: 'Alert for detected slow connections',
  },
  slowEffectiveConnectionHelpLink: {
    id: 'app.network.connection.effective.slow.help',
    description: 'Help link for slow connections',
  },
});

const NotificationsBarContainer = (props) => {
  const { message, color } = props;
  if (_.isEmpty(message)) {
    return null;
  }


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

const reconnect = () => {
  Meteor.reconnect();
};

export default injectIntl(withTracker(({ intl }) => {
  const { status, connected, retryTime } = Meteor.status();
  const data = {};

  const user = Users.findOne({ userId: Auth.userID }, { fields: { effectiveConnectionType: 1 } });

  if (user) {
    const { effectiveConnectionType } = user;
    if (ENABLE_NETWORK_MONITORING && SLOW_CONNECTIONS_TYPES.includes(effectiveConnectionType)) {
      data.message = (
        <SlowConnection effectiveConnectionType={effectiveConnectionType}>
          {intl.formatMessage(intlMessages.slowEffectiveConnectionDetected)}
          <a href={HELP_LINK} target="_blank" rel="noopener noreferrer">
            {intl.formatMessage(intlMessages.slowEffectiveConnectionHelpLink)}
          </a>
        </SlowConnection>
      );
    }
  }

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
        data.message = (
          <Fragment>
            {intl.formatMessage(intlMessages.waitingMessage, { 0: getRetrySeconds() })}
            <button className={styles.retryButton} type="button" onClick={reconnect}>
              {intl.formatMessage(intlMessages.retryNow)}
            </button>
          </Fragment>
        );
        break;
      }
      default:
        break;
    }

    return data;
  }

  const meetingId = Auth.meetingID;
  const breakouts = breakoutService.getBreakouts();

  const msg = { id: `${intlMessages.alertBreakoutEndsUnderMinutes.id}${REMAINING_TIME_ALERT_THRESHOLD == 1 ? 'Singular' : 'Plural'}` };

  if (breakouts.length > 0) {
    const currentBreakout = breakouts.find(b => b.breakoutId === meetingId);

    if (currentBreakout) {
      data.message = (
        <BreakoutRemainingTime
          breakoutRoom={currentBreakout}
          messageDuration={intlMessages.breakoutTimeRemaining}
          timeEndedMessage={intlMessages.breakoutWillClose}
          alertMessage={
            intl.formatMessage(msg, {0: REMAINING_TIME_ALERT_THRESHOLD})
          }
          alertUnderMinutes={REMAINING_TIME_ALERT_THRESHOLD}
        />
      );
    }
  }

  const meetingTimeRemaining = MeetingTimeRemaining.findOne({ meetingId });
  const Meeting = Meetings.findOne({ meetingId },
    { fields: { 'meetingProp.isBreakout': 1 } });

  if (meetingTimeRemaining && Meeting) {
    const { timeRemaining } = meetingTimeRemaining;
    const { isBreakout } = Meeting.meetingProp;
    const underThirtyMin = timeRemaining && timeRemaining <= (REMAINING_TIME_THRESHOLD * 60);

    const msg = { id: `${intlMessages.alertMeetingEndsUnderMinutes.id}${REMAINING_TIME_ALERT_THRESHOLD == 1 ? 'Singular' : 'Plural'}` };

    if (underThirtyMin && !isBreakout) {
      data.message = (
        <BreakoutRemainingTime
          breakoutRoom={meetingTimeRemaining}
          messageDuration={intlMessages.meetingTimeRemaining}
          timeEndedMessage={intlMessages.meetingWillClose}
          alertMessage={
            intl.formatMessage(msg, {0: REMAINING_TIME_ALERT_THRESHOLD})
          }
          alertUnderMinutes={REMAINING_TIME_ALERT_THRESHOLD}
        />
      );
    }
  }

  data.alert = true;
  data.color = 'primary';
  return data;
})(NotificationsBarContainer));

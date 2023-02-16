import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { defineMessages, injectIntl } from 'react-intl';
import injectNotify from '/imports/ui/components/common/toast/inject-notify/component';
import humanizeSeconds from '/imports/utils/humanizeSeconds';
import _ from 'lodash';
import MeetingRemainingTimeComponent from './component';
import BreakoutService from '/imports/ui/components/breakout-room/service';
import { Text, Time } from './styles';
import { meetingIsBreakout } from '/imports/ui/components/app/service';

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
  alertBreakoutEndsUnderMinutes: {
    id: 'app.meeting.alertBreakoutEndsUnderMinutes',
    description: 'Alert that tells that the breakout ends under x minutes',
  },
  alertMeetingEndsUnderMinutes: {
    id: 'app.meeting.alertMeetingEndsUnderMinutes',
    description: 'Alert that tells that the meeting ends under x minutes',
  },
});

let timeRemaining = 0;
let prevTimeRemaining = 0;
let lastAlertTime = null;

const METEOR_SETTINGS_APP = Meteor.settings.public.app;
const REMAINING_TIME_ALERT_THRESHOLD_ARRAY = METEOR_SETTINGS_APP.remainingTimeAlertThresholdArray;

const timeRemainingDep = new Tracker.Dependency();
let timeRemainingInterval = null;

class breakoutRemainingTimeContainer extends React.Component {
  componentWillUnmount() {
    clearInterval(timeRemainingInterval);
    timeRemainingInterval = null;
    timeRemaining = null;
  }

  render() {
    const { message, bold } = this.props;
    if (_.isEmpty(message)) {
      return null;
    }
    if (bold) {
      const words = message.split(' ');
      const time = words.pop();
      const text = words.join(' ');
      return (
        <MeetingRemainingTimeComponent>
          <Text>{text}</Text>
          <br />
          <Time data-test="breakoutRemainingTime">{time}</Time>
        </MeetingRemainingTimeComponent>
      );
    }
    return (
      <MeetingRemainingTimeComponent>
        {message}
      </MeetingRemainingTimeComponent>
    );
  }
}

const getTimeRemaining = () => {
  timeRemainingDep.depend();
  return timeRemaining;
};

const setTimeRemaining = (sec) => {
  if (sec !== timeRemaining) {
    timeRemaining = sec;
    timeRemainingDep.changed();
  }
};

const startCounter = (sec, set, get, interval) => {
  clearInterval(interval);
  if (!sec) return;
  set(sec);
  return setInterval(() => set(get() - 1), 1000);
};


export default injectNotify(injectIntl(withTracker(({
  breakoutRoom,
  intl,
  notify,
  messageDuration,
  timeEndedMessage,
  fromBreakoutPanel,
  displayAlerts,
}) => {
  const data = {};
  if (breakoutRoom) {
    const roomRemainingTime = breakoutRoom.timeRemaining;
    const localRemainingTime = getTimeRemaining();
    const shouldResync = prevTimeRemaining !== roomRemainingTime && roomRemainingTime !== localRemainingTime;

    if ((!timeRemainingInterval || shouldResync) && roomRemainingTime) {
      prevTimeRemaining = roomRemainingTime;

      timeRemainingInterval = startCounter(
        roomRemainingTime,
        setTimeRemaining,
        getTimeRemaining,
        timeRemainingInterval,
      );
    }
  } else if (timeRemainingInterval) {
    clearInterval(timeRemainingInterval);
  }

  if (timeRemaining >= 0 && timeRemainingInterval) {
    if (timeRemaining > 0) {
      const time = getTimeRemaining();
      const alertsInSeconds = REMAINING_TIME_ALERT_THRESHOLD_ARRAY.map((item) => item * 60);

      if (alertsInSeconds.includes(time) && time !== lastAlertTime && displayAlerts) {
        const timeInMinutes = time / 60;
        const message = meetingIsBreakout()
          ? intlMessages.alertBreakoutEndsUnderMinutes
          : intlMessages.alertMeetingEndsUnderMinutes;
        const msg = { id: `${message.id}${timeInMinutes === 1 ? 'Singular' : 'Plural'}` };
        const alertMessage = intl.formatMessage(msg, { 0: timeInMinutes });

        lastAlertTime = time;
        notify(alertMessage, 'info', 'rooms');
      }
      data.message = intl.formatMessage(messageDuration, { 0: humanizeSeconds(time) });
      if (fromBreakoutPanel) data.bold = true;
    } else {
      clearInterval(timeRemainingInterval);
      BreakoutService.setCapturedContentUploading();
      data.message = intl.formatMessage(timeEndedMessage || intlMessages.breakoutWillClose);
    }
  } else if (breakoutRoom) {
    data.message = intl.formatMessage(intlMessages.calculatingBreakoutTimeRemaining);
  }
  return data;
})(breakoutRemainingTimeContainer)));

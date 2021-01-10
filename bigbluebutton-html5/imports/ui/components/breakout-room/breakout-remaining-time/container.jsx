import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { defineMessages, injectIntl } from 'react-intl';
import injectNotify from '/imports/ui/components/toast/inject-notify/component';
import humanizeSeconds from '/imports/utils/humanizeSeconds';
import _ from 'lodash';
import BreakoutRemainingTimeComponent from './component';

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
});

let timeRemaining = 0;
const timeRemainingDep = new Tracker.Dependency();
let timeRemainingInterval = null;

class breakoutRemainingTimeContainer extends React.Component {
  componentWillUnmount() {
    clearInterval(timeRemainingInterval);
    timeRemainingInterval = null;
    timeRemaining = null;
  }

  render() {
    const { message } = this.props;
    if (_.isEmpty(message)) {
      return null;
    }
    return (
      <BreakoutRemainingTimeComponent>
        {message}
      </BreakoutRemainingTimeComponent>
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
  alertMessage,
  alertUnderMinutes,
}) => {
  const data = {};
  if (breakoutRoom) {
    const roomRemainingTime = breakoutRoom.timeRemaining;

    if (!timeRemainingInterval && roomRemainingTime) {
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
      if (time === (alertUnderMinutes * 60) && alertMessage) {
        notify(alertMessage, 'info', 'rooms');
      }
      data.message = intl.formatMessage(messageDuration, { 0: humanizeSeconds(time) });
    } else {
      clearInterval(timeRemainingInterval);
      data.message = intl.formatMessage(timeEndedMessage || intlMessages.breakoutWillClose);
    }
  } else if (breakoutRoom) {
    data.message = intl.formatMessage(intlMessages.calculatingBreakoutTimeRemaining);
  }
  return data;
})(breakoutRemainingTimeContainer)));

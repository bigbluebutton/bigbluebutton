import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'underscore';
import NavBarService from '../nav-bar/service';
import Auth from '/imports/ui/services/auth';
import { humanizeSeconds } from '/imports/utils/humanizeSeconds';

import NotificationsBar from './component';

// the connection is up and running
const STATUS_CONNECTED = 'connected';

// disconnected and trying to open a new connection
const STATUS_CONNECTING = 'connecting';

// permanently failed to connect; e.g., the client and server support different versions of DDP
const STATUS_FAILED = 'failed';

// failed to connect and waiting to try to reconnect
const STATUS_WAITING = 'waiting';

// user has disconnected the connection
const STATUS_OFFLINE = 'offline';

const intlMessages = defineMessages({
  failedMessage: {
    id: 'app.failedMessage',
    defaultMessage: 'Apologies, trouble connecting to the server.',
    description: 'Message when the client is trying to connect to the server',
  },
  connectingMessage: {
    id: 'app.connectingMessage',
    defaultMessage: 'Connecting...',
    description: 'Message when the client is trying to connect to the server',
  },
  waitingMessage: {
    id: 'app.waitingMessage',
    defaultMessage: 'Disconnected. Trying to reconnect in {seconds} seconds...',
    description: 'Message when the client is trying to reconnect to the server',
  },
  breakoutTimeRemaining: {
    id: 'app.breakoutTimeRemainingMessage',
    defaultMessage: 'Breakout Room time remaining: {time}',
    description: 'Message that tells how much time is remaining for the breakout room',
  },
  breakoutWillClose: {
    id: 'app.breakoutWillCloseMessage',
    defaultMessage: 'Time ended. Breakout Room will close soon',
    description: 'Message that tells time has ended and breakout will close',
  },
  calculatingBreakoutTimeRemaining: {
    id: 'app.calculatingBreakoutTimeRemaining',
    defaultMessage: 'Calculating remaining time...',
    description: 'Message that tells that the remaining time is being calculated',
  },
});

class NotificationsBarContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (_.isEmpty(this.props.message)) {
      return null;
    }

    const { message, color } = this.props;

    return (
      <NotificationsBar color={color}>
        {message}
      </NotificationsBar>
    );
  }
}

let retrySeconds = 0;
let timeRemaining = 0;
const retrySecondsDep = new Tracker.Dependency;
const timeRemainingDep = new Tracker.Dependency;
let retryInterval = null;
let timeRemainingInterval = null;

const getRetrySeconds = () => {
  retrySecondsDep.depend();
  return retrySeconds;
};

const getTimeRemaining = () => {
  timeRemainingDep.depend();
  return timeRemaining;
};

const setRetrySeconds = (sec = 0) => {
  if (sec !== retrySeconds) {
    retrySeconds = sec;
    retrySecondsDep.changed();
  }
};

const setTimeRemaining = (sec = 0) => {
  if (sec !== timeRemaining) {
    timeRemaining = sec;
    changeDocumentTitle(sec);
    timeRemainingDep.changed();
  }
};

const startCounter = (sec, set, get, interval) => {
  clearInterval(interval);
  set(sec);
  return setInterval(() => {
    set(get() - 1);
  }, 1000);
};

const changeDocumentTitle = (sec) => {
  if (sec >= 0) {
    const affix = `(${humanizeSeconds(sec)}`;
    const splitTitle = document.title.split(') ');
    const title = splitTitle[1] || splitTitle[0];
    document.title = [affix, title].join(') ');
  }
};

export default injectIntl(createContainer(({ intl }) => {
  const { status, connected, retryCount, retryTime } = Meteor.status();
  let data = {};

  if (!connected) {
    data.color = 'primary';
    switch (status) {
      case STATUS_OFFLINE:
      case STATUS_FAILED:
        data.color = 'danger';
        data.message = intl.formatMessage(intlMessages.failedMessage);
        break;
      case STATUS_CONNECTING:
        data.message = intl.formatMessage(intlMessages.connectingMessage);
        break;
      case STATUS_WAITING:
        const sec = Math.round((retryTime - (new Date()).getTime()) / 1000);
        retryInterval = startCounter(sec, setRetrySeconds, getRetrySeconds, retryInterval);
        data.message = intl.formatMessage(
          intlMessages.waitingMessage,
          { seconds: getRetrySeconds() }
        );
        break;
    }

    return data;
  }

  const meetingId = Auth.meetingID;
  const breakouts = NavBarService.getBreakouts();

  if (breakouts) {
    const currentBreakout = breakouts.find(b => b.breakoutMeetingId === meetingId);
    if (currentBreakout) {
      roomRemainingTime = currentBreakout.timeRemaining;
      if (!timeRemainingInterval && roomRemainingTime) {
        timeRemainingInterval = startCounter(roomRemainingTime,
                                             setTimeRemaining,
                                             getTimeRemaining,
                                             timeRemainingInterval);
      }
    } else if (timeRemainingInterval) {
      clearInterval(timeRemainingInterval);
    }

    const timeRemaining = getTimeRemaining();
    if (timeRemaining) {
      if (timeRemaining > 0) {
        data.message = intl.formatMessage(
          intlMessages.breakoutTimeRemaining,
          { time: humanizeSeconds(timeRemaining) }
        );
      } else {
        clearInterval(timeRemainingInterval);
        data.message = intl.formatMessage(intlMessages.breakoutWillClose);
      }
    } else if (!timeRemaining && currentBreakout) {
      data.message = intl.formatMessage(intlMessages.calculatingBreakoutTimeRemaining);
    }
  }

  data.color = 'primary';
  return data;
}, NotificationsBarContainer));

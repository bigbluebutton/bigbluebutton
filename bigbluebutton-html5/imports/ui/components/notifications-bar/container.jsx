import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'underscore';
import NavBarService from '../nav-bar/service';
import Auth from '/imports/ui/services/auth';

import NotificationsBar from './component';

const humanizeSeconds = time => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return [
    minutes,
    seconds,
  ].map(x => (x < 10) ? `0${x}` : x).join(':');
};

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
const retrySecondsDep = new Tracker.Dependency;

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

let retryInterval = null;
const startCounter = (sec) => {
  clearInterval(retryInterval);

  setRetrySeconds(sec);
  retryInterval = setInterval(() => {
    setRetrySeconds(getRetrySeconds() - 1);
  }, 1000);
};

// breakout
let timeRemaining = 0;
const timeRemainingDep = new Tracker.Dependency;

const getTimeRemaining = () => {
  timeRemainingDep.depend();
  return timeRemaining;
};

const setTimeRemaining = (sec = 0) => {
  if (sec !== timeRemaining) {
    timeRemaining = sec;
    timeRemainingDep.changed();
  }
};

let timeRemainingInterval = null;
const startTimeRemainingCounter = (sec) => {
  clearInterval(timeRemainingInterval);
  setTimeRemaining(sec);
  timeRemainingInterval = setInterval(() => {
    setTimeRemaining(getTimeRemaining() - 1);
  }, 1000);
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
        startCounter(Math.round((retryTime - (new Date()).getTime()) / 1000));
        data.message = intl.formatMessage(
          intlMessages.waitingMessage,
          { seconds: getRetrySeconds() }
        );
        break;
    }
  }

  const meetingId = Auth.meetingID;
  const breakouts = NavBarService.getBreakouts();
  if (breakouts) {
    const currentBreakout = breakouts.find(b => b.breakoutMeetingId === meetingId);
    if (currentBreakout) {
      roomRemainingTime = currentBreakout.timeRemaining;
      if (!timeRemainingInterval && roomRemainingTime) {
        startTimeRemainingCounter(roomRemainingTime);
      }
    }
  }

  if (getTimeRemaining()) {
    data.color = 'primary';
    data.message = `Breakout Room Time Remaining: ${humanizeSeconds(getTimeRemaining())}`;
  }

  return data;
}, NotificationsBarContainer));

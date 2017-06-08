import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
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
const retrySecondsDep = new Tracker.Dependency();
const timeRemainingDep = new Tracker.Dependency();
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
  const data = {};

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
          { 0: getRetrySeconds() },
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
          { 0: humanizeSeconds(timeRemaining) },
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

import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'underscore';

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

  return data;
}, NotificationsBarContainer));

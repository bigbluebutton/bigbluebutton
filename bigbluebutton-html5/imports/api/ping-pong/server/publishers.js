import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import _ from 'lodash';

const COLLECTION_NAME = 'ping-pong';
const POLL_INTERVAL = 5000;

function pingPong(credentials) {
  const { meetingId, requesterUserId } = credentials;
  const id = _.uniqueId('pong-');
  Logger.info(`Starting ping-pong publish for userId: ${requesterUserId}`);
  const pongSender = (interval) => {
    const payload = {
      pong: {
        message: 'pong',
        time: Date.now(),
        meetingId,
      },
    };
    let fn = this.added.bind(this);
    if (interval) fn = this.changed.bind(this);
    fn(COLLECTION_NAME, id, payload);
  };
  pongSender();
  this.ready();
  const interval = Meteor.setInterval(() => pongSender(true), POLL_INTERVAL);

  this.onStop(() => {
    Meteor.clearInterval(interval);
  });
}

Meteor.publish('ping-pong', pingPong);

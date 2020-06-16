import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import _ from 'lodash';
import { extractCredentials } from '/imports/api/common/server/helpers';

const COLLECTION_NAME = 'ping-pong';
const INTERVAL_IN_SETTINGS = (Meteor.settings.public.pingPong.clearUsersInSeconds) * 1000;
const INTERVAL_TIME = INTERVAL_IN_SETTINGS < 10000 ? 10000 : INTERVAL_IN_SETTINGS;
const PONG_INTERVAL_IN_SETTINGS = (Meteor.settings.public.pingPong.pongTimeInSeconds) * 1000;
const PONG_INTERVAL = PONG_INTERVAL_IN_SETTINGS >= (INTERVAL_TIME / 2)
  ? (INTERVAL_TIME / 2) : PONG_INTERVAL_IN_SETTINGS;

function pingPong() {
  if (!this.userId) {
    return; // TODO-- is there a more appropriate set to return?
  }
  const { meetingId, requesterUserId } = extractCredentials(this.userId);
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
  const interval = Meteor.setInterval(() => pongSender(true), PONG_INTERVAL);

  this.onStop(() => {
    Meteor.clearInterval(interval);
  });
}

Meteor.publish('ping-pong', pingPong);

import Presentations from '/imports/api/presentations';
import { Slides } from '/imports/api/slides';
import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import addShapee from '../modifiers/addShapee';

export default function addShape(shape) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'test';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    shape.meetingId = meetingId;
    addShapee(shape);

    // RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, shape);
  } catch (err) {
    Logger.error(`Exception while invoking method addShape ${err.stack}`);
  }
}
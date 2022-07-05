import { Meteor } from 'meteor/meteor';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';
import addAsset from '../modifiers/addAsset';

export default function persistAsset(asset) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'test';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    asset.meetingId = meetingId;
    addAsset(asset);

    // RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, shape);
  } catch (err) {
    Logger.error(`Exception while invoking method persistAsset ${err.stack}`);
  }
}

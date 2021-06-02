import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

export default function createBreakoutRoom(rooms, durationInMinutes, record = false) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const BREAKOUT_LIM = Meteor.settings.public.app.breakouts.breakoutRoomLimit;
  const MIN_BREAKOUT_ROOMS = 2;
  const MAX_BREAKOUT_ROOMS = BREAKOUT_LIM > MIN_BREAKOUT_ROOMS ? BREAKOUT_LIM : MIN_BREAKOUT_ROOMS;
  const EVENT_NAME = 'CreateBreakoutRoomsCmdMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    if (rooms.length > MAX_BREAKOUT_ROOMS) {
      Logger.info(`Attempt to create breakout rooms with invalid number of rooms in meeting id=${meetingId}`);
      return;
    }
    const payload = {
      record,
      durationInMinutes,
      rooms,
      meetingId,
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method createBreakoutRoom ${err.stack}`);
  }
}

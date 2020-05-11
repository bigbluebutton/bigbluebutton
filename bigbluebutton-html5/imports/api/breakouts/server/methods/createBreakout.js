import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function createBreakoutRoom(rooms, durationInMinutes, record = false) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  const eventName = 'CreateBreakoutRoomsCmdMsg';
  if (rooms.length > 8) return Logger.info(`Attempt to create breakout rooms with invalid number of rooms in meeting id=${meetingId}`);
  const payload = {
    record,
    durationInMinutes,
    rooms,
    meetingId,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, eventName, meetingId, requesterUserId, payload);
}

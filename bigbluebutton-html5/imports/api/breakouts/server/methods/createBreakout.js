import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';

export default function createBreakoutRoom(credentials, rooms, durationInMinutes, record = false) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;

  const {
    meetingId,
    requesterUserId,
    requesterToken,
  } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

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

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import _ from 'lodash';

export default function createBreakoutRoom(credentials, numberOfRooms, durationInMinutes, freeJoin, record = false) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;

  const {
    meetingId,
    requesterUserId,
    requesterToken,
    confname,
  } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  const eventName = 'CreateBreakoutRoomsCmdMsg';
  const rooms = _.range(1, numberOfRooms + 1).map(value => ({
    users: [],
    name: `${confname} (Room - ${value})`,
    freeJoin,
    sequence: value,
  }));

  const payload = {
    record,
    durationInMinutes,
    rooms,
    meetingId,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, eventName, meetingId, requesterUserId, payload);
}

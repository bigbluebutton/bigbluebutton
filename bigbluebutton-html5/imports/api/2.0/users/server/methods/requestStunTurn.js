import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis2x';
import Logger from '/imports/startup/server/logger';

export default function requestStunTurn(meetingId, requesterUserId) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.fromBBBUsers;
  const EVENT_NAME = 'send_stun_turn_info_request_message';

  check(meetingId, String);
  check(requesterUserId, String);

  const payload = {
    meeting_id: meetingId,
    requester_id: requesterUserId,
  };

  Logger.verbose(`User '${requesterUserId}' requested stun/turn from meeting '${meetingId}'`);

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, payload);
}

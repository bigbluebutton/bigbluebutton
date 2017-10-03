import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis2x';
import Logger from '/imports/startup/server/logger';
import VoiceUsers from '/imports/api/2.0/voice-users';
import kickVoiceUser from '/imports/api/2.0/voice-users/server/methods/kickVoiceUser';

export default function kickUser(credentials, userId) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'EjectUserFromMeetingCmdMsg';

  const { requesterUserId, meetingId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(userId, String);

  const payload = {
    userId,
    ejectedBy: requesterUserId,
  };

  const userVoice = VoiceUsers.findOne({
    intId: userId,
    meetingId,
  });

  if (userVoice.joined) {
    kickVoiceUser(credentials, userId);
  }

  Logger.warn(`User '${userId}' was kicked by '${requesterUserId}' from meeting '${meetingId}'`);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, 'nodeJSapp', payload);
}

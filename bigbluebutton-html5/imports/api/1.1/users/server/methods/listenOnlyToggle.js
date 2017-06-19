import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/1.1/meetings';
import Users from '/imports/api/1.1/users';

export default function listenOnlyToggle(credentials, isJoining = true) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toBBBApps.meeting;

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(isJoining, Boolean);

  let EVENT_NAME;

  if (isJoining) {
    EVENT_NAME = 'user_connected_to_global_audio';
  } else {
    EVENT_NAME = 'user_disconnected_from_global_audio';
  }

  const Meeting = Meetings.findOne({ meetingId });
  if (!Meeting) {
    throw new Meteor.Error(
      'meeting-not-found', 'You need a valid meeting to be able to toggle audio');
  }

  check(Meeting.voiceConf, String);

  const User = Users.findOne({
    meetingId,
    userId: requesterUserId,
  });

  if (!User) {
    throw new Meteor.Error(
      'user-not-found', 'You need a valid user to be able to toggle audio');
  }

  check(User.user.name, String);

  const payload = {
    userid: requesterUserId,
    meeting_id: meetingId,
    voice_conf: Meeting.voiceConf,
    name: User.user.name,
  };

  Logger.verbose(`User '${requesterUserId}' ${isJoining
    ? 'joined' : 'left'} global audio from meeting '${meetingId}'`);

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, payload);
}

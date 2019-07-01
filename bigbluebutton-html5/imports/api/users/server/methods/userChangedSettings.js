import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import setChangedSettings from '../modifiers/setChangedSettings';
import Users from '../../index';

export default function userChangedSettings(credentials, setting, value) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UserChangedSettingsEvtMsg';

  const { meetingId, requesterUserId } = credentials;

  const User = Users.findOne({ meetingId, userId: requesterUserId });

  if (!meetingId || !requesterUserId || !User || User[setting] === value) return;

  check(meetingId, String);
  check(requesterUserId, String);
  check(setting, String);
  check(value, Match.Any);

  const payload = {
    meetingId,
    requesterUserId,
    setting,
    value,
  };

  setChangedSettings(requesterUserId, setting, value);

  RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}

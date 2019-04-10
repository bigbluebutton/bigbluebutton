import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';

export default function toggleLockSettings(credentials, meeting) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ChangeLockSettingsInMeetingCmdMsg';

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(meeting.lockSettingsProps, {
    disableCam: Boolean,
    disableMic: Boolean,
    disablePrivateChat: Boolean,
    disablePublicChat: Boolean,
    lockedLayout: Boolean,
    lockOnJoin: Boolean,
    lockOnJoinConfigurable: Boolean,
    setBy: Match.Maybe(String),
  });

  const payload = {
    disableCam: meeting.lockSettingsProps.disableCam,
    disableMic: meeting.lockSettingsProps.disableMic,
    disablePrivChat: meeting.lockSettingsProps.disablePrivateChat,
    disablePubChat: meeting.lockSettingsProps.disablePublicChat,
    lockedLayout: meeting.lockSettingsProps.lockedLayout,
    lockOnJoin: meeting.lockSettingsProps.lockOnJoin,
    lockOnJoinConfigurable: meeting.lockSettingsProps.lockOnJoinConfigurable,
    setBy: requesterUserId,
  };

  RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}

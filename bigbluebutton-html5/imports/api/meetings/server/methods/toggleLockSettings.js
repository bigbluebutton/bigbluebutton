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
  check(meeting.lockSettingsProp.disableCam, Boolean);
  check(meeting.lockSettingsProp.disableMic, Boolean);
  check(meeting.lockSettingsProp.disablePrivChat, Boolean);
  check(meeting.lockSettingsProp.disablePubChat, Boolean);
  check(meeting.lockSettingsProp.lockedLayout, Boolean);
  check(meeting.lockSettingsProp.lockOnJoin, Boolean);
  check(meeting.lockSettingsProp.lockOnJoinConfigurable, Boolean);

  const payload = {
    disableCam: meeting.lockSettingsProp.disableCam,
    disableMic: meeting.lockSettingsProp.disableMic,
    disablePrivChat: meeting.lockSettingsProp.disablePrivChat,
    disablePubChat: meeting.lockSettingsProp.disablePubChat,
    lockedLayout: meeting.lockSettingsProp.lockedLayout,
    lockOnJoin: meeting.lockSettingsProp.lockOnJoin,
    lockOnJoinConfigurable: meeting.lockSettingsProp.lockOnJoinConfigurable,
    setBy: requesterUserId,
  };

  RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}

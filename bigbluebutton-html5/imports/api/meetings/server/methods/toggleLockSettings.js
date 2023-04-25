import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';

export default function toggleLockSettings(lockSettingsProps) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ChangeLockSettingsInMeetingCmdMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(lockSettingsProps, {
      disableCam: Boolean,
      disableMic: Boolean,
      disablePrivateChat: Boolean,
      disablePublicChat: Boolean,
      disableNotes: Boolean,
      hideUserList: Boolean,
      lockOnJoin: Boolean,
      lockOnJoinConfigurable: Boolean,
      hideViewersCursor: Boolean,
      hideViewersAnnotation: Boolean,
      setBy: Match.Maybe(String),
    });

    const {
      disableCam,
      disableMic,
      disablePrivateChat: disablePrivChat,
      disablePublicChat: disablePubChat,
      disableNotes,
      hideUserList,
      lockOnJoin,
      lockOnJoinConfigurable,
      hideViewersCursor,
      hideViewersAnnotation,
    } = lockSettingsProps;

    const payload = {
      disableCam,
      disableMic,
      disablePrivChat,
      disablePubChat,
      disableNotes,
      hideUserList,
      lockOnJoin,
      lockOnJoinConfigurable,
      hideViewersCursor,
      hideViewersAnnotation,
      setBy: requesterUserId,
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method toggleLockSettings ${err.stack}`);
  }
}

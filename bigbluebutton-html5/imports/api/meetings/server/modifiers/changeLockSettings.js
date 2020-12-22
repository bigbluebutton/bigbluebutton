import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';
import { check } from 'meteor/check';

export default function changeLockSettings(meetingId, payload) {
  check(meetingId, String);
  check(payload, {
    disableCam: Boolean,
    disableMic: Boolean,
    disablePrivChat: Boolean,
    disablePubChat: Boolean,
    disableNote: Boolean,
    hideUserList: Boolean,
    lockedLayout: Boolean,
    lockOnJoin: Boolean,
    lockOnJoinConfigurable: Boolean,
    setBy: Match.Maybe(String),
  });

  const {
    disableCam,
    disableMic,
    disablePrivChat,
    disablePubChat,
    disableNote,
    hideUserList,
    lockedLayout,
    lockOnJoin,
    lockOnJoinConfigurable,
    setBy,
  } = payload;

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: {
      lockSettingsProps: {
        disableCam,
        disableMic,
        disablePrivateChat: disablePrivChat,
        disablePublicChat: disablePubChat,
        disableNote,
        hideUserList,
        lockedLayout,
        lockOnJoin,
        lockOnJoinConfigurable,
        setBy,
      },
    },
  };


  try {
    const { numberAffected } = Meetings.upsert(selector, modifier);

    if (numberAffected) {
      Logger.info(`Changed meeting={${meetingId}} updated lock settings`);
    } else {
      Logger.info(`meeting={${meetingId}} lock settings were not updated`);
    }
  } catch (err) {
    Logger.error(`Changing meeting={${meetingId}} lock settings: ${err}`);
  }
}

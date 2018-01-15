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
    lockedLayout: Boolean,
    lockOnJoin: Boolean,
    lockOnJoinConfigurable: Boolean,
    setBy: String,
  });

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: {
      lockSettingsProp: payload,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Changing meeting={${meetingId}} lock settings: ${err}`);
    }

    if (!numChanged) {
      return Logger.info(`meeting={${meetingId}} lock settings were not updated`);
    }

    return Logger.info(`Changed meeting={${meetingId}} updated lock settings`);
  };

  return Meetings.upsert(selector, modifier, cb);
}

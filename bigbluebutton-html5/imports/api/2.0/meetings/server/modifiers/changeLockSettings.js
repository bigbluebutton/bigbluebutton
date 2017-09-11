import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/2.0/meetings';
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
    meetingId
  };

  const modifier = {
    $set: {
      lockSettingsProp: payload,
    },
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Changing meeting={${meetingId}} lock settings: ${err}`);
    }
  };
  
  return Meetings.upsert(selector, modifier, cb);
};

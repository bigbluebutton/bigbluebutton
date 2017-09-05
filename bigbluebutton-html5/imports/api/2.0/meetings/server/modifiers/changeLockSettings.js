import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/2.0/meetings';
import { check } from 'meteor/check';

export default function changeLockSettings(meetingId, payload) {
  check(meetingId, String);
  check(payload, Object)

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
      return Logger.error(`Removing user from collection: ${err}`);
    }
  };
  
  return Meetings.upsert(selector, modifier, cb);
};

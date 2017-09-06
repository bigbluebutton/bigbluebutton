import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/2.0/users';
import { check } from 'meteor/check';

export default function changeUserLock(meetingId, payload) {
  check(meetingId, String);
  check(payload, Object)

  const selector = {
    userId: payload.userId,
  };

  const modifier = {
    $set: {
      locked: payload.locked,
    },
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Changing user lock setting: ${err}`);
    }
  };
  
  return Users.upsert(selector, modifier, cb);
};
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import Users from '/imports/api/users';

export default function setMobile(meetingId, userId) {
  check(meetingId, String);
  check(userId, String);

  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      mobile: true,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Assigning mobile user: ${err}`);
      return;
    }

    if (numChanged) {
      Logger.info(`Assigned mobile user id=${userId} meeting=${meetingId}`);
    }
  };

  return Users.update(selector, modifier, cb);
}

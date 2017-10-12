import { check } from 'meteor/check';
import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';

export default function setApprovedStatus(meetingId, userId, approved = false, approvedBy = null) {
  check(meetingId, String);
  check(userId, String);
  check(approved, Boolean);

  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      approved,
      approvedBy,
    },
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Updating approved status user=${userId}: ${err}`);
    }

    return Logger.info(`Updated approved status user=${userId} approved=${approved} meeting=${meetingId}`);
  };

  return Users.update(selector, modifier, cb);
}

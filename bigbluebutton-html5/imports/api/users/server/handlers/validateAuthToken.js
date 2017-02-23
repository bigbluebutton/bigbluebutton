import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

export default function handleValidateAuthToken({ payload }) {
  const meetingId = payload.meeting_id;
  const userId = payload.userid;
  const validStatus = payload.valid;

  check(meetingId, String);
  check(userId, String);
  check(validStatus, String);

  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      validated: validStatus,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Validating auth token: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Validated auth token as '${validStatus}' user=${userId} meeting=${meetingId}`);
    }
  };

  return Users.update(selector, modifier, cb);
};

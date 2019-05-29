import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

export default function userLeftMeeting(credentials) {
  const {
    meetingId,
    requesterUserId,
  } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);

  const selector = {
    meetingId,
    userId: requesterUserId,
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`leaving dummy user to collection: ${err}`);
      return;
    }
    if (numChanged) {
      Logger.info(`user left id=${requesterUserId} meeting=${meetingId}`);
    }
  };

  return Users.update(
    selector,
    {
      $set: {
        loggedOut: true,
      },
    },
    cb,
  );
}

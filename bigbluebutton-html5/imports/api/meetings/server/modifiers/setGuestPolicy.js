import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function setGuestPolicy(meetingId, guestPolicy) {
  check(meetingId, String);
  check(guestPolicy, String);

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: {
      usersProp: {
        guestPolicy,
      }
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Changing meeting guest policy: ${err}`);
    }

    if (!numChanged) {
      return Logger.info(`Meeting's ${meetingId} guest policy=${guestPolicy} wasn't updated`);
    }

    return Logger.info(`Meeting's ${meetingId} guest policy=${guestPolicy} updated`);
  };

  return Meetings.update(selector, modifier, cb);
}

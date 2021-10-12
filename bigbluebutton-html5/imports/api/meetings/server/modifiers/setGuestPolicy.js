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
      'usersProp.guestPolicy': guestPolicy,
    },
  };

  try {
    const { numberAffected } = Meetings.upsert(selector, modifier);

    if (numberAffected) {
      Logger.verbose(`Set guest policy meetingId=${meetingId} guestPolicy=${guestPolicy}`);
    }
  } catch (err) {
    Logger.error(`Setting guest policy: ${err}`);
  }
}

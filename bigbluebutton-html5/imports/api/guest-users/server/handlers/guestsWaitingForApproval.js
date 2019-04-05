import stringHash from 'string-hash';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import GuestUsers from '/imports/api/guest-users/';

const COLOR_LIST = [
  '#7b1fa2', '#6a1b9a', '#4a148c', '#5e35b1', '#512da8', '#4527a0',
  '#311b92', '#3949ab', '#303f9f', '#283593', '#1a237e', '#1976d2', '#1565c0',
  '#0d47a1', '#0277bd', '#01579b',
];

export default function handleGuestsWaitingForApproval({ body }, meetingId) {
  const { guests } = body;
  check(guests, Array);
  check(meetingId, String);

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding guest user to collection: ${err}`);
    }

    const { insertedId } = numChanged;
    if (insertedId) {
      return Logger.info(`Added guest user meeting=${meetingId}`);
    }

    return Logger.info(`Upserted guest user meeting=${meetingId}`);
  };

  return guests.map(guest => GuestUsers.upsert({
    meetingId,
    intId: guest.intId,
  }, {
    approved: false,
    denied: false,
    ...guest,
    meetingId,
    loginTime: new Date().getTime(),
    color: COLOR_LIST[stringHash(guest.intId) % COLOR_LIST.length],
  }, cb));
}

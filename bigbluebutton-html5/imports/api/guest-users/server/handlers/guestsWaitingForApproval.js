import stringHash from 'string-hash';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import GuestUsers from '/imports/api/guest-users/';
import updatePositionInWaitingQueue from '../methods/updatePositionInWaitingQueue';

//TODO receive color from akka-apps
const COLOR_LIST = [
  '#7b1fa2', '#6a1b9a', '#4a148c', '#5e35b1', '#512da8', '#4527a0',
  '#311b92', '#3949ab', '#303f9f', '#283593', '#1a237e', '#1976d2', '#1565c0',
  '#0d47a1', '#0277bd', '#01579b',
];

export default async function handleGuestsWaitingForApproval({ body }, meetingId) {
  const { guests } = body;
  check(guests, Array);
  check(meetingId, String);

  const result = await Promise.all(guests.map(async (guest) => {
    try {
      const { insertedId, numberAffected } = await GuestUsers.upsertAsync({
        meetingId,
        intId: guest.intId,
      }, {
        approved: false,
        denied: false,
        ...guest,
        meetingId,
        loginTime: guest.registeredOn,
        privateGuestLobbyMessage: '',
        color: COLOR_LIST[stringHash(guest.intId) % COLOR_LIST.length],
      });

      if (insertedId) {
        Logger.info(`Added guest user meeting=${meetingId}`);

        /** Update position of waiting users after user
        *   has entered the guest lobby
        */
        updatePositionInWaitingQueue(meetingId);
      } else if (numberAffected) {
        Logger.info(`Upserted guest user meeting=${meetingId}`);

        updatePositionInWaitingQueue(meetingId);
      }
    } catch (err) {
      Logger.error(`Adding guest user to collection: ${err}`);
    }
  }));
  return result;
}

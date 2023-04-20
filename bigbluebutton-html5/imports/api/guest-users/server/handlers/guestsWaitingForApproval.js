import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import GuestUsers from '/imports/api/guest-users/';
import updatePositionInWaitingQueue from '../methods/updatePositionInWaitingQueue';

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

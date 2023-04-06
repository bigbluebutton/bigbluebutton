import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import GuestUsers from '/imports/api/guest-users/';
import updatePositionInWaitingQueue from '../methods/updatePositionInWaitingQueue';

export default function handleGuestsWaitingForApproval({ body }, meetingId) {
  const { guests } = body;
  check(guests, Array);
  check(meetingId, String);

  return guests.map((guest) => {
    try {
      const { insertedId, numberAffected } = GuestUsers.upsert({
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
  });
}

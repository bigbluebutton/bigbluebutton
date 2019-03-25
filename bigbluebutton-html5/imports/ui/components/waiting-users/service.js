import { makeCall } from '/imports/ui/services/api';

const guestUsersCall = (guestsArray, status) => makeCall('allowPendingUsers', guestsArray, status);

export default {
  guestUsersCall,
};

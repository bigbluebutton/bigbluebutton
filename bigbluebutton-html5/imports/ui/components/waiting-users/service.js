import { makeCall } from '/imports/ui/services/api';

const guestUsersCall = (guestsArray, status) => makeCall('allowPendingUsers', guestsArray, status);

const changeGuestPolicy = policyRule => makeCall('changeGuestPolicy', policyRule);
export default {
  guestUsersCall,
  changeGuestPolicy,
};

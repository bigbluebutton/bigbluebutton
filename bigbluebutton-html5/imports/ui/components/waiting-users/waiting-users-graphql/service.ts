import { GuestWaitingUser } from './queries';
import { makeCall } from '/imports/ui/services/api';

export const privateMessageVisible = (id: string) => {
  const privateInputSpace = document.getElementById(id);
  if (privateInputSpace) {
    if (privateInputSpace.style.display === 'block') {
      privateInputSpace.style.display = 'none';
    } else {
      privateInputSpace.style.display = 'block';
    }
  }
};

export const getNameInitials = (name: string) => {
  const nameInitials = name.slice(0, 2);

  return nameInitials.replace(/^\w/, (c: string) => c.toUpperCase());
};

export const guestUsersCall = (guestsArray: GuestWaitingUser[], status: string) => makeCall('allowPendingUsers', guestsArray, status);

export const setGuestLobbyMessage = (message: string) => makeCall('setGuestLobbyMessage', message);

export const setPrivateGuestLobbyMessage = (message: string, guestId: string) => makeCall('setPrivateGuestLobbyMessage', message, guestId);

export const changeGuestPolicy = (policyRule: string) => makeCall('changeGuestPolicy', policyRule);

export default {
  privateMessageVisible,
  guestUsersCall,
  setGuestLobbyMessage,
  getNameInitials,
  changeGuestPolicy,
};

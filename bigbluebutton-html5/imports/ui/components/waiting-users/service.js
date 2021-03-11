import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import { makeCall } from '/imports/ui/services/api';

const guestUsersCall = (guestsArray, status) => makeCall('allowPendingUsers', guestsArray, status);

const changeGuestPolicy = policyRule => makeCall('changeGuestPolicy', policyRule);

const isGuestLobbyMessageEnabled = Meteor.settings.public.app.enableGuestLobbyMessage;

const getGuestLobbyMessage = () => {
  const meeting = Meetings.findOne(
    { meetingId: Auth.meetingID },
    { fields: { guestLobbyMessage: 1 } },
  );

  if (meeting) return meeting.guestLobbyMessage;

  return '';
};

const setGuestLobbyMessage = (message) => makeCall('setGuestLobbyMessage', message);

export default {
  guestUsersCall,
  changeGuestPolicy,
  isGuestLobbyMessageEnabled,
  getGuestLobbyMessage,
  setGuestLobbyMessage,
};

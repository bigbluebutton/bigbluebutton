import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';

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

const getGuestPolicy = () => {
  const meeting = Meetings.findOne(
    { meetingId: Auth.meetingID },
    { fields: { 'usersPolicies.guestPolicy': 1 } },
  );

  return meeting.usersPolicies.guestPolicy;
};

const isWaitingRoomEnabled = () => getGuestPolicy() === 'ASK_MODERATOR';

const isGuestLobbyMessageEnabled = window.meetingClientSettings.public.app.enableGuestLobbyMessage;

// We use the dynamicGuestPolicy rule for allowing the rememberChoice checkbox
const allowRememberChoice = window.meetingClientSettings.public.app.dynamicGuestPolicy;

const getGuestLobbyMessage = () => {
  const meeting = Meetings.findOne(
    { meetingId: Auth.meetingID },
    { fields: { guestLobbyMessage: 1 } },
  );

  if (meeting) return meeting.guestLobbyMessage;

  return '';
};

export default {
  privateMessageVisible,
  getNameInitials,
  getGuestPolicy,
  isWaitingRoomEnabled,
  isGuestLobbyMessageEnabled,
  getGuestLobbyMessage,
  allowRememberChoice,
};

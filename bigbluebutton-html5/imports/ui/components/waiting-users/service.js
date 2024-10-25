import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import GuestUsers from '/imports/api/guest-users';
import { makeCall } from '/imports/ui/services/api';

const sizeOfBatches = 3; // commonly deployments have 3-4 or more instances of bbb-html5-frontend
const delayForApprovalOfGuests = Meteor.settings.public.app.delayForApprovalOfGuests || 500;

const breakIntoSmallerGroups = (array) => {
  return array
  .map((_, index) => {
    return index % sizeOfBatches === 0 ? array.slice(index, index + sizeOfBatches) : null;
  })
  .filter(group => group) // remove null values
  .map(group => group.filter(item => item !== undefined)); // remove undefined items
};

async function guestUsersCall(guestsArray, status) {
  // Processing large arrays (20+ guests) puts a lot of stress on frontends
  // Here we split the approved guests into batches and space out the batch processing
  for (const batch of breakIntoSmallerGroups(guestsArray)) {
    makeCall('allowPendingUsers', batch, status);
    await new Promise(resolve => setTimeout(resolve, delayForApprovalOfGuests));
  };
}

const changeGuestPolicy = (policyRule) => makeCall('changeGuestPolicy', policyRule);

const getGuestPolicy = () => {
  const meeting = Meetings.findOne(
    { meetingId: Auth.meetingID },
    { fields: { 'usersProp.guestPolicy': 1 } },
  );

  return meeting.usersProp.guestPolicy;
};

const isWaitingRoomEnabled = () => getGuestPolicy() === 'ASK_MODERATOR';

const isGuestLobbyMessageEnabled = Meteor.settings.public.app.enableGuestLobbyMessage;

// We use the dynamicGuestPolicy rule for allowing the rememberChoice checkbox
const allowRememberChoice = Meteor.settings.public.app.dynamicGuestPolicy;

const getGuestLobbyMessage = () => {
  const meeting = Meetings.findOne(
    { meetingId: Auth.meetingID },
    { fields: { guestLobbyMessage: 1 } },
  );

  if (meeting) return meeting.guestLobbyMessage;

  return '';
};

const setGuestLobbyMessage = (message) => makeCall('setGuestLobbyMessage', message);

const getPrivateGuestLobbyMessage = (guestId) => {
  const meeting = Meetings.findOne(
    { meetingId: Auth.meetingID },
    { fields: { guestLobbyMessage: 1 } },
  );

  if (meeting) {
    const guestUser = GuestUsers.findOne(
      { meetingId: Auth.meetingID, intId: guestId },
      { fields: { privateGuestLobbyMessage: 1} },
    );

   if (guestUser.privateGuestLobbyMessage !== '' ) {
      return guestUser.privateGuestLobbyMessage;
    } else {
      return meeting.guestLobbyMessage;
    }
  }
  return '';
};

const setPrivateGuestLobbyMessage = (message, guestId) => makeCall('setPrivateGuestLobbyMessage', message, guestId);

const privateMessageVisible = (id) => {
  const privateInputSpace = document.getElementById(id);
  if (privateInputSpace.style.display === "block") {
    privateInputSpace.style.display = "none";
  } else {
    privateInputSpace.style.display = "block";
  }
};

export default {
  guestUsersCall,
  privateMessageVisible,
  changeGuestPolicy,
  getGuestPolicy,
  isWaitingRoomEnabled,
  isGuestLobbyMessageEnabled,
  getGuestLobbyMessage,
  setGuestLobbyMessage,
  getPrivateGuestLobbyMessage,
  setPrivateGuestLobbyMessage,
  allowRememberChoice,
};

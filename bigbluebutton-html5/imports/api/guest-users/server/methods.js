import { Meteor } from 'meteor/meteor';
import allowPendingUsers from '/imports/api/guest-users/server/methods/allowPendingUsers';
import setGuestLobbyMessage from '/imports/api/guest-users/server/methods/setGuestLobbyMessage';
import setPrivateGuestLobbyMessage from '/imports/api/guest-users/server/methods/setPrivateGuestLobbyMessage';

Meteor.methods({
  allowPendingUsers,
  setGuestLobbyMessage,
  setPrivateGuestLobbyMessage,
});

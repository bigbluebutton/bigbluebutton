import { Meteor } from 'meteor/meteor';
import allowPendingUsers from '/imports/api/guest-users/server/methods/allowPendingUsers';
import changeGuestPolicy from '/imports/api/guest-users/server/methods/changeGuestPolicy';
import setGuestLobbyMessage from '/imports/api/guest-users/server/methods/setGuestLobbyMessage';
import setPrivateGuestLobbyMessage from '/imports/api/guest-users/server/methods/setPrivateGuestLobbyMessage';

Meteor.methods({
  allowPendingUsers,
  changeGuestPolicy,
  setGuestLobbyMessage,
  setPrivateGuestLobbyMessage,
});

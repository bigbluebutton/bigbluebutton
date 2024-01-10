import { Meteor } from 'meteor/meteor';
import setGuestLobbyMessage from '/imports/api/guest-users/server/methods/setGuestLobbyMessage';
import setPrivateGuestLobbyMessage from '/imports/api/guest-users/server/methods/setPrivateGuestLobbyMessage';

Meteor.methods({
  setGuestLobbyMessage,
  setPrivateGuestLobbyMessage,
});

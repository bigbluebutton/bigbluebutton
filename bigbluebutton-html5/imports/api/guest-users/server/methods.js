import { Meteor } from 'meteor/meteor';
import allowPendingUsers from '/imports/api/guest-users/server/methods/allowPendingUsers';
import requestGusetUsers from './methods/requestGuestUsers';

Meteor.methods({
  allowPendingUsers,
  requestGusetUsers,
});

import { Meteor } from 'meteor/meteor';
import allowPendingUsers from '/imports/api/guest-users/server/methods/allowPendingUsers';
import changeGuestPolicy from '/imports/api/guest-users/server/methods/changeGuestPolicy';

Meteor.methods({
  allowPendingUsers,
  changeGuestPolicy,
});

import { Meteor } from 'meteor/meteor';
import allowPendingUsers from '/imports/api/guest-users/server/methods/allowPendingUsers';

Meteor.methods({
  allowPendingUsers,
});

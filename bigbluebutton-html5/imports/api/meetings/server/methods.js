import { Meteor } from 'meteor/meteor';
import transferUser from './methods/transferUser';
import clearRandomlySelectedUser from './methods/clearRandomlySelectedUser';

Meteor.methods({
  transferUser,
  clearRandomlySelectedUser,
});

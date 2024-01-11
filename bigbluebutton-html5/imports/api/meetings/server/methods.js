import { Meteor } from 'meteor/meteor';
import transferUser from './methods/transferUser';
import toggleWebcamsOnlyForModerator from './methods/toggleWebcamsOnlyForModerator';
import clearRandomlySelectedUser from './methods/clearRandomlySelectedUser';

Meteor.methods({
  transferUser,
  toggleWebcamsOnlyForModerator,
  clearRandomlySelectedUser,
});

import { Meteor } from 'meteor/meteor';
import validateAuthToken from './methods/validateAuthToken';
import setUserEffectiveConnectionType from './methods/setUserEffectiveConnectionType';
import userActivitySign from './methods/userActivitySign';

Meteor.methods({
  validateAuthToken,
  setUserEffectiveConnectionType,
  userActivitySign,
});

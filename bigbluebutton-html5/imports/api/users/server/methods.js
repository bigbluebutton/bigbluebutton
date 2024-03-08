import { Meteor } from 'meteor/meteor';
import validateAuthToken from './methods/validateAuthToken';
import setUserEffectiveConnectionType from './methods/setUserEffectiveConnectionType';
import userActivitySign from './methods/userActivitySign';
import validateConnection from './methods/validateConnection';

Meteor.methods({
  validateConnection,
  validateAuthToken,
  setUserEffectiveConnectionType,
  userActivitySign,
});

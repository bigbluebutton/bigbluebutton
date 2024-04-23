import { Meteor } from 'meteor/meteor';
import setUserEffectiveConnectionType from './methods/setUserEffectiveConnectionType';
import userActivitySign from './methods/userActivitySign';
import validateConnection from './methods/validateConnection';

Meteor.methods({
  validateConnection,
  setUserEffectiveConnectionType,
  userActivitySign,
});

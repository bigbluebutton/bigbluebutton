import { Meteor } from 'meteor/meteor';
import setUserEffectiveConnectionType from './methods/setUserEffectiveConnectionType';
import userActivitySign from './methods/userActivitySign';

Meteor.methods({
  setUserEffectiveConnectionType,
  userActivitySign,
});

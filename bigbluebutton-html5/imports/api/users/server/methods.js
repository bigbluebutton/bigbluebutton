import { Meteor } from 'meteor/meteor';
import setUserEffectiveConnectionType from './methods/setUserEffectiveConnectionType';
import validateConnection from './methods/validateConnection';

Meteor.methods({
  validateConnection,
  setUserEffectiveConnectionType,
});

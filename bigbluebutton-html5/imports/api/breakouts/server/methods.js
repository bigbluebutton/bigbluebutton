import { Meteor } from 'meteor/meteor';
import requestJoinURL from './methods/requestJoinURL';
import setBreakoutsTime from '/imports/api/breakouts/server/methods/setBreakoutsTime';

Meteor.methods({
  requestJoinURL,
  setBreakoutsTime,
});

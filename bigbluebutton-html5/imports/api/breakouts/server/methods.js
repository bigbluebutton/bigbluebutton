import { Meteor } from 'meteor/meteor';
import requestJoinURL from './methods/requestJoinURL';
import setBreakoutsTime from '/imports/api/breakouts/server/methods/setBreakoutsTime';
import sendMessageToAllBreakouts from './methods/sendMessageToAllBreakouts';

Meteor.methods({
  requestJoinURL,
  setBreakoutsTime,
  sendMessageToAllBreakouts,
});

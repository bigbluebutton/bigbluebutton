import { Meteor } from 'meteor/meteor';
import createBreakoutRoom from '/imports/api/breakouts/server/methods/createBreakout';
import requestJoinURL from './methods/requestJoinURL';
import endAllBreakouts from './methods/endAllBreakouts';
import setBreakoutsTime from '/imports/api/breakouts/server/methods/setBreakoutsTime';
import sendMessageToAllBreakouts from './methods/sendMessageToAllBreakouts';

Meteor.methods({
  requestJoinURL,
  createBreakoutRoom,
  endAllBreakouts,
  setBreakoutsTime,
  sendMessageToAllBreakouts,
});

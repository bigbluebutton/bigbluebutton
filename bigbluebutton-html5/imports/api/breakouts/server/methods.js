import { Meteor } from 'meteor/meteor';
import createBreakoutRoom from '/imports/api/breakouts/server/methods/createBreakout';
import requestJoinURL from './methods/requestJoinURL';
import endAllBreakouts from './methods/endAllBreakouts';
import extendBreakoutsTime from './methods/extendBreakoutsTime';
import sendMessageToAllBreakouts from './methods/sendMessageToAllBreakouts';

Meteor.methods({
  requestJoinURL,
  createBreakoutRoom,
  endAllBreakouts,
  extendBreakoutsTime,
  sendMessageToAllBreakouts,
});

import { Meteor } from 'meteor/meteor';
import createBreakoutRoom from '/imports/api/breakouts/server/methods/createBreakout';
import requestJoinURL from './methods/requestJoinURL';
import endAllBreakouts from './methods/endAllBreakouts';
import getParentMeeting from "./methods/getParentMeeting";
import extendBreakoutsTime from './methods/extendBreakoutsTime';

Meteor.methods({
  requestJoinURL,
  createBreakoutRoom,
  endAllBreakouts,
  getParentMeeting,
  extendBreakoutsTime,
});

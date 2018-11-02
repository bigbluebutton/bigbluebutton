import { Meteor } from 'meteor/meteor';
import createBreakoutRoom from '/imports/api/breakouts/server/methods/createBreakout';
import mapToAcl from '/imports/startup/mapToAcl';
import requestJoinURL from './methods/requestJoinURL';
import endAllBreakouts from './methods/endAllBreakouts';

Meteor.methods(mapToAcl(['methods.requestJoinURL', 'methods.createBreakoutRoom', 'methods.endAllBreakouts'], {
  requestJoinURL,
  createBreakoutRoom,
  endAllBreakouts,
}));

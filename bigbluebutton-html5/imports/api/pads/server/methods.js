import { Meteor } from 'meteor/meteor';
import createGroup from './methods/createGroup';
import createSession from './methods/createSession';
import getPadId from './methods/getPadId';
import pinPad from './methods/pinPad';

Meteor.methods({
  createGroup,
  createSession,
  getPadId,
  pinPad,
});

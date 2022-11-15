import { Meteor } from 'meteor/meteor';
import createGroup from './methods/createGroup';
import createSession from './methods/createSession';
import getPadId from './methods/getPadId';
import getPadContent from './methods/getPadContent';
import pinPad from './methods/pinPad';

Meteor.methods({
  createGroup,
  createSession,
  getPadId,
  getPadContent,
  pinPad,
});

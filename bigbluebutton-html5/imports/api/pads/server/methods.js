import { Meteor } from 'meteor/meteor';
import createGroup from './methods/createGroup';
import createSession from './methods/createSession';
import getPadId from './methods/getPadId';

Meteor.methods({
  createGroup,
  createSession,
  getPadId,
});

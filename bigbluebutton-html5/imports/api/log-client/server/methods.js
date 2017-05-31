import { Meteor } from 'meteor/meteor';
import logClient from './methods/logClient';
import mapToAcl from '/imports/startup/mapToAcl';

Meteor.methods({
  logClient,
});

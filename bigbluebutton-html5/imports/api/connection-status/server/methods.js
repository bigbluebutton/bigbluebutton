import { Meteor } from 'meteor/meteor';
import addConnectionStatus from './methods/addConnectionStatus';
import voidConnection from './methods/voidConnection';

Meteor.methods({
  addConnectionStatus,
  voidConnection,
});

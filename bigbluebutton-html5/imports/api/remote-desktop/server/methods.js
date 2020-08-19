import { Meteor } from 'meteor/meteor';
import startWatchingRemoteDesktop from './methods/startWatchingRemoteDesktop';
import stopWatchingRemoteDesktop from './methods/stopWatchingRemoteDesktop';

Meteor.methods({
  startWatchingRemoteDesktop,
  stopWatchingRemoteDesktop,
});

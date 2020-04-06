import { Meteor } from 'meteor/meteor';
import startWatchingExternalVideo from './methods/startWatchingExternalVideo';
import stopWatchingExternalVideo from './methods/stopWatchingExternalVideo';
import initializeExternalVideo from './methods/initializeExternalVideo';
import emitExternalVideoEvent from './methods/emitExternalVideoEvent';

Meteor.methods({
  initializeExternalVideo,
  startWatchingExternalVideo,
  stopWatchingExternalVideo,
  emitExternalVideoEvent,
});

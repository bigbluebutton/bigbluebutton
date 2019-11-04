import { Meteor } from 'meteor/meteor';
import startWatchingExternalVideo from './methods/startWatchingExternalVideo';
import stopWatchingExternalVideo from './methods/stopWatchingExternalVideo';
import initializeExternalVideo from './methods/initializeExternalVideo';

Meteor.methods({
  initializeExternalVideo,
  startWatchingExternalVideo,
  stopWatchingExternalVideo,
});

import { Meteor } from 'meteor/meteor';
import startWatchingExternalVideo from './methods/startWatchingExternalVideo';
import stopWatchingExternalVideo from './methods/stopWatchingExternalVideo';

Meteor.methods({
  startWatchingExternalVideo,
  stopWatchingExternalVideo,
});

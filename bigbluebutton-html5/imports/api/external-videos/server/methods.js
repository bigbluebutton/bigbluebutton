import { Meteor } from 'meteor/meteor';
import startWatchingExternalVideo from './methods/startWatchingExternalVideo';
import stopWatchingExternalVideo from './methods/stopWatchingExternalVideo';
import updateExternalVideoStatus from './methods/updateExternalVideoStatus';

Meteor.methods({
  startWatchingExternalVideo,
  stopWatchingExternalVideo,
  updateExternalVideoStatus,
});

import { Meteor } from 'meteor/meteor';
import startWatchingExternalVideo from './methods/startWatchingExternalVideo';
import stopWatchingExternalVideo from './methods/stopWatchingExternalVideo';
import emitExternalVideoEvent from './methods/emitExternalVideoEvent';

Meteor.methods({
  startWatchingExternalVideo,
  stopWatchingExternalVideo,
  emitExternalVideoEvent,
});

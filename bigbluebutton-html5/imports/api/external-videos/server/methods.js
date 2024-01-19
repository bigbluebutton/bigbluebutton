import { Meteor } from 'meteor/meteor';
import stopWatchingExternalVideo from './methods/stopWatchingExternalVideo';
import emitExternalVideoEvent from './methods/emitExternalVideoEvent';

Meteor.methods({
  stopWatchingExternalVideo,
  emitExternalVideoEvent,
});

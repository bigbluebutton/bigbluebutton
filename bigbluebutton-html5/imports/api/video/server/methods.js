import { Meteor } from 'meteor/meteor';
import userShareWebcam from './methods/userShareWebcam';
import userUnshareWebcam from './methods/userUnshareWebcam';

Meteor.methods({
  userShareWebcam, userUnshareWebcam,
});

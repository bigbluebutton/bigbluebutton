import { Meteor } from 'meteor/meteor';
import AudioService from '/imports/ui/components/audio/service';
import { makeCall } from '/imports/ui/services/api';
import audioManager from '/imports/ui/services/audio-manager';
import VideoService from '/imports/ui/components/video-provider/service';
import { screenshareHasEnded } from '/imports/ui/components/screenshare/service';

export const getIsMicrophoneUser = () => {
  return (AudioService.isConnectedToBreakout() || AudioService.isConnected())
    && !AudioService.isListenOnly();
};

export const getIsReconnecting = () => {
  return AudioService.isReconnecting();
};

export const getIsConnected = () => {
  return Meteor.status().connected;
};

export const endAllBreakouts = () => {
  makeCall('endAllBreakouts');
};

export const forceExitAudio = () => {
  audioManager.forceExitAudio();
};

export const stopVideo = () => {
  VideoService.storeDeviceIds();
  VideoService.exitVideo();
};

export const finishScreenShare = () => {
  return screenshareHasEnded();
};


export default {
  getIsMicrophoneUser,
  getIsReconnecting,
  endAllBreakouts,
  forceExitAudio,
  stopVideo,
  finishScreenShare,
};

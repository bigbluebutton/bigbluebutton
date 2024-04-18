import { Meteor } from 'meteor/meteor';
import AudioService from '/imports/ui/components/audio/service';
import { makeCall } from '/imports/ui/services/api';
import AudioManager from '/imports/ui/services/audio-manager';
import VideoService from '/imports/ui/components/video-provider/service';
import { screenshareHasEnded } from '/imports/ui/components/screenshare/service';
import { didUserSelectedListenOnly, didUserSelectedMicrophone } from '../../../audio/audio-modal/service';
import logger from '/imports/startup/client/logger';

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
  AudioManager.forceExitAudio();
};

export const stopVideo = (unshareVideo: (stream: string)=> void) => {
  VideoService.storeDeviceIds();
  VideoService.exitVideo(unshareVideo);
};

export const finishScreenShare = () => {
  return screenshareHasEnded();
};

const logUserCouldNotRejoinAudio = () => {
  logger.warn({
    logCode: 'mainroom_audio_rejoin',
    extraInfo: { logType: 'user_action' },
  }, 'leaving breakout room couldn\'t rejoin audio in the main room');
};

export const rejoinAudio = () => {
  if (didUserSelectedMicrophone()) {
    AudioManager.joinMicrophone().catch(() => {
      logUserCouldNotRejoinAudio();
    });
  } else if (didUserSelectedListenOnly()) {
    AudioManager.joinListenOnly().catch(() => {
      logUserCouldNotRejoinAudio();
    });
  }
};

export default {
  getIsMicrophoneUser,
  getIsReconnecting,
  endAllBreakouts,
  forceExitAudio,
  stopVideo,
  finishScreenShare,
  rejoinAudio,
};

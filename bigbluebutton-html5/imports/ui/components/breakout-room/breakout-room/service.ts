import AudioService, {
  didUserSelectListenOnly,
  didUserSelectMicrophone,
} from '/imports/ui/components/audio/service';
import AudioManager from '/imports/ui/services/audio-manager';
import VideoService from '/imports/ui/components/video-provider/service';
import type { Stream } from '/imports/ui/components/video-provider/types';
import { screenshareHasEnded } from '/imports/ui/components/screenshare/service';
import logger from '/imports/startup/client/logger';

export const getIsMicrophoneUser = () => {
  return (AudioService.isConnectedToBreakout() || AudioService.isConnected())
    && !AudioService.isListenOnly();
};

export const getIsReconnecting = () => {
  return AudioService.isReconnecting();
};

export const forceExitAudio = () => {
  AudioManager.forceExitAudio();
};

export const stopVideo = (exitVideo: () => void, streams: Stream[]) => {
  VideoService.storeDeviceIds(streams);
  exitVideo();
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
  if (didUserSelectMicrophone()) {
    AudioManager.joinMicrophone({ muted: true }).catch(() => {
      logUserCouldNotRejoinAudio();
    });
  } else if (didUserSelectListenOnly()) {
    AudioManager.joinListenOnly().catch(() => {
      logUserCouldNotRejoinAudio();
    });
  }
};

export default {
  getIsMicrophoneUser,
  getIsReconnecting,
  forceExitAudio,
  stopVideo,
  finishScreenShare,
  rejoinAudio,
};

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import getFromUserSettings from '/imports/ui/services/users-settings';
import Storage from '/imports/ui/services/storage/session';
import logger from '/imports/startup/client/logger';
import AudioManager from '/imports/ui/services/audio-manager';
import VideoService from '/imports/ui/components/video-provider/video-provider-graphql/service';

const MUTED_KEY = 'muted';
// @ts-ignore - temporary, while meteor exists in the project
const APP_CONFIG = window.meetingClientSettings.public.app;
// @ts-ignore - temporary, while meteor exists in the project
const TOGGLE_MUTE_THROTTLE_TIME = window.meetingClientSettings.public.media.toggleMuteThrottleTime;
const DEVICE_LABEL_MAX_LENGTH = 40;
const CLIENT_DID_USER_SELECTED_MICROPHONE_KEY = 'clientUserSelectedMicrophone';
const CLIENT_DID_USER_SELECTED_LISTEN_ONLY_KEY = 'clientUserSelectedListenOnly';
const MEDIA_TAG = window.meetingClientSettings.public.media.mediaTag;

export const handleLeaveAudio = (meetingIsBreakout: boolean) => {
  if (!meetingIsBreakout) {
    Storage.setItem(CLIENT_DID_USER_SELECTED_MICROPHONE_KEY, !!false);
    Storage.setItem(CLIENT_DID_USER_SELECTED_LISTEN_ONLY_KEY, !!false);
  }

  const skipOnFistJoin = getFromUserSettings(
    'bbb_skip_check_audio_on_first_join',
    APP_CONFIG.skipCheckOnJoin,
  );
  if (skipOnFistJoin && !Storage.getItem('getEchoTest')) {
    Storage.setItem('getEchoTest', true);
  }

  AudioManager.forceExitAudio();
  logger.info(
    {
      logCode: 'audiocontrols_leave_audio',
      extraInfo: { logType: 'user_action' },
    },
    'audio connection closed by user',
  );
};

export const toggleMuteMicrophone = (
  muted: boolean,
  toggleVoice: (userId?: string | null, muted?: boolean | null) => void,
) => {
  Storage.setItem(MUTED_KEY, !muted);

  if (muted) {
    logger.info(
      {
        logCode: 'audiomanager_unmute_audio',
        extraInfo: { logType: 'user_action' },
      },
      'microphone unmuted by user',
    );
    toggleVoice();
  } else {
    logger.info(
      {
        logCode: 'audiomanager_mute_audio',
        extraInfo: { logType: 'user_action' },
      },
      'microphone muted by user',
    );
    toggleVoice();
  }
};

export const truncateDeviceName = (deviceName: string) => {
  if (deviceName && deviceName.length <= DEVICE_LABEL_MAX_LENGTH) {
    return deviceName;
  }
  return `${deviceName.substring(0, DEVICE_LABEL_MAX_LENGTH - 3)}...`;
};

export const notify = (message: string, error: boolean, icon?: string) => {
  AudioManager.notify(message, error, icon);
};

export const liveChangeInputDevice = (inputDeviceId: string) => AudioManager.liveChangeInputDevice(inputDeviceId);

export const liveChangeOutputDevice = (inputDeviceId: string, isLive: boolean) => AudioManager
  .changeOutputDevice(inputDeviceId, isLive);

export const getSpeakerLevel = () => {
  const audioElement = document.querySelector(MEDIA_TAG) as HTMLMediaElement;
  return audioElement ? audioElement.volume : 0;
};

export const setSpeakerLevel = (level: number) => {
  const audioElement = document.querySelector(MEDIA_TAG) as HTMLMediaElement;
  if (audioElement) {
    audioElement.volume = level;
  }
};

export const muteAway = (
  muted: boolean,
  away: boolean,
  voiceToggle: (userId?: string | null, muted?: boolean | null) => void,
) => {
  const prevAwayMuted = Storage.getItem('prevAwayMuted') || false;
  const prevSpeakerLevelValue = Storage.getItem('prevSpeakerLevel') || 1;

  // mute/unmute microphone
  if (muted === away && muted === Boolean(prevAwayMuted)) {
    toggleMuteMicrophone(muted, voiceToggle);
    Storage.setItem('prevAwayMuted', !muted);
  } else if (!away && !muted && Boolean(prevAwayMuted)) {
    toggleMuteMicrophone(muted, voiceToggle);
  }

  // mute/unmute speaker
  if (away) {
    setSpeakerLevel(Number(prevSpeakerLevelValue));
  } else {
    Storage.setItem('prevSpeakerLevel', getSpeakerLevel());
    setSpeakerLevel(0);
  }

  // enable/disable video
  VideoService.setTrackEnabled(away);
};

export default {
  handleLeaveAudio,
  toggleMuteMicrophone,
  truncateDeviceName,
  notify,
  liveChangeInputDevice,
  getSpeakerLevel,
  setSpeakerLevel,
};

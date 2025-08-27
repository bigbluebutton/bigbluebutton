import { ReactiveVar, makeVar, useReactiveVar } from '@apollo/client';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Storage from '/imports/ui/services/storage/session';
import logger from '/imports/startup/client/logger';
import AudioManager from '/imports/ui/services/audio-manager';
import VideoService from '/imports/ui/components/video-provider/service';
import Auth from '/imports/ui/services/auth';
import { debounce } from '/imports/utils/debounce';
import { throttle } from '/imports/utils/throttle';
import {
  setUserSelectedMicrophone,
  setUserSelectedListenOnly,
} from '/imports/ui/components/audio/service';

const MUTED_KEY = 'muted';
const DEVICE_LABEL_MAX_LENGTH = 40;
const TOGGLE_MUTE_THROTTLE_TIME = 300;
const TOGGLE_MUTE_DEBOUNCE_TIME = 500;

export const handleLeaveAudio = (meetingIsBreakout: boolean) => {
  if (!meetingIsBreakout) {
    setUserSelectedMicrophone(false);
    setUserSelectedListenOnly(false);
  }

  const skipOnFistJoin = getFromUserSettings(
    'bbb_skip_check_audio_on_first_join',
    window.meetingClientSettings.public.app.skipCheckOnJoin,
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

export const muteLoadingState: ReactiveVar<boolean> = makeVar(false);

export const useIsMuteLoading = () => useReactiveVar(muteLoadingState);

const toggleMute = (
  muted: boolean,
  toggleVoice: (userId: string, muted: boolean) => void,
  actionType = 'user_action',
  isBreakout: boolean = false,
  parentId: string,
) => {
  const toggle = (storageKey: string) => {
    if (muted) {
      if (AudioManager.inputDeviceId === 'listen-only') {
        // User is in duplex audio, passive-sendrecv, but has no input device set
        // Unmuting should not be allowed at all
        return;
      }

      logger.info({
        logCode: 'audiomanager_unmute_audio',
        extraInfo: { logType: actionType },
      }, 'microphone unmuted');
      Storage.setItem(storageKey, false);
      toggleVoice(Auth.userID as string, false);
    } else {
      logger.info({
        logCode: 'audiomanager_mute_audio',
        extraInfo: { logType: actionType },
      }, 'microphone muted');
      Storage.setItem(storageKey, true);
      toggleVoice(Auth.userID as string, true);
    }
  };

  const meetingId = isBreakout && parentId
    ? parentId
    : Auth.meetingID;
  const storageKey = `${MUTED_KEY}_${meetingId}`;

  toggle(storageKey);
  if (AudioManager.inputDeviceId !== 'listen-only') {
    muteLoadingState(true);
  }
};

const toggleMuteMicrophoneThrottled = throttle(toggleMute, TOGGLE_MUTE_THROTTLE_TIME);

const toggleMuteMicrophoneDebounced = debounce(toggleMuteMicrophoneThrottled, TOGGLE_MUTE_DEBOUNCE_TIME,
  { leading: true, trailing: false });

export const toggleMuteMicrophone = (
  muted: boolean,
  toggleVoice: (userId: string, muted: boolean, isBreakout: boolean, parentId: string) => void,
  isBreakout: boolean = false,
  parentId: string = '',
) => {
  return toggleMuteMicrophoneDebounced(muted, toggleVoice, isBreakout, parentId);
};

// Debounce is not needed here, as this function should only called by the system.
export const toggleMuteMicrophoneSystem = (
  muted: boolean,
  toggleVoice: (userId: string, muted: boolean) => void,
  isBreakout: boolean,
  parentId: string,
) => {
  return toggleMute(muted, toggleVoice, 'system_action', isBreakout, parentId);
};

export const getToggleMuteMicrophone = (isBreakout: boolean, parentId: string) => {
  return [
    (muted: boolean, toggleVoice: (userId: string, muted: boolean) => void) => {
      return toggleMuteMicrophone(muted, toggleVoice, isBreakout, parentId);
    },
    (muted: boolean, toggleVoice: (userId: string, muted: boolean) => void) => {
      return toggleMuteMicrophoneSystem(muted, toggleVoice, isBreakout, parentId);
    },
  ];
};

export const startPushToTalk = (
  toggleVoice: (userId: string, muted: boolean) => void,
  callback: (mute: boolean, toggleVoice: (userId: string, muted: boolean) => void) => void,
) => {
  callback(true, toggleVoice);
};

export const stopPushToTalk = (
  toggleVoice: (userId: string, muted: boolean) => void,
  callback: (mute: boolean, toggleVoice: (userId: string, muted: boolean) => void) => void,
) => {
  callback(false, toggleVoice);
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
  const MEDIA_TAG = window.meetingClientSettings.public.media.mediaTag;

  const audioElement = document.querySelector(MEDIA_TAG) as HTMLMediaElement;
  return audioElement ? audioElement.volume : 0;
};

export const setSpeakerLevel = (level: number) => {
  const MEDIA_TAG = window.meetingClientSettings.public.media.mediaTag;

  const audioElement = document.querySelector(MEDIA_TAG) as HTMLMediaElement;
  if (audioElement) {
    audioElement.volume = level;
  }
};

export const muteAway = (
  muted: boolean,
  away: boolean,
  voiceToggle: (userId: string, muted: boolean) => void,
) => {
  const prevAwayMuted = Storage.getItem('prevAwayMuted') || false;
  const prevSpeakerLevelValue = Storage.getItem('prevSpeakerLevel') || 1;

  // mute/unmute microphone
  if (muted === away && muted === Boolean(prevAwayMuted)) {
    toggleMuteMicrophoneThrottled(muted, voiceToggle);
    Storage.setItem('prevAwayMuted', !muted);
  } else if (!away && !muted && Boolean(prevAwayMuted)) {
    toggleMuteMicrophoneThrottled(muted, voiceToggle);
  }

  // mute/unmute speaker
  const MUTE_SPEAKER = window.meetingClientSettings.public.media.muteAudioOutputWhenAway;

  if (MUTE_SPEAKER) {
    if (away) {
      setSpeakerLevel(Number(prevSpeakerLevelValue));
    } else {
      Storage.setItem('prevSpeakerLevel', getSpeakerLevel());
      setSpeakerLevel(0);
    }
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
  startPushToTalk,
  stopPushToTalk,
  getToggleMuteMicrophone,
};

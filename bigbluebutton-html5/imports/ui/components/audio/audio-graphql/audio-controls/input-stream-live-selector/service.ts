import { ReactiveVar, makeVar, useReactiveVar } from '@apollo/client';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Storage from '/imports/ui/services/storage/session';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
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
import meetingStaticData from '/imports/ui/core/singletons/meetingStaticData';

const MUTED_KEY = 'muted';
const PREV_SPEAKER_LEVEL_KEY = 'prevSpeakerLevel';
const DEVICE_LABEL_MAX_LENGTH = 40;
const TOGGLE_MUTE_THROTTLE_TIME = 300;
const TOGGLE_MUTE_DEBOUNCE_TIME = 500;

export const SPEAKER_LEVEL_KEY = 'speakerLevel';

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
  isMuted: boolean,
  toggleVoice: (userId: string, muted: boolean) => void,
  actionType = 'user_action',
) => {
  const meetingStaticStore = meetingStaticData.getMeetingData();
  const newMutedState = !isMuted;
  const toggle = (storageKey: string) => {
    // If we are using LiveKit audio state, we allow calling the mute/unmute
    // actions directly on the AudioManager instance.
    const shouldRunLocalMute = AudioManager.shouldUseLiveKitAudioState()
      && newMutedState !== AudioManager.isMuted;

    if (isMuted) {
      if (AudioManager.inputDeviceId === 'listen-only') {
        // User is in duplex audio, passive-sendrecv, but has no input device set
        // Unmuting should not be allowed at all
        return;
      }

      logger.info({
        logCode: 'audiomanager_unmute_audio',
        extraInfo: { logType: actionType },
      }, 'microphone unmuted');
      Storage.setItem(storageKey, newMutedState);

      if (shouldRunLocalMute) AudioManager.unmute();

      toggleVoice(Auth.userID as string, newMutedState);
    } else {
      logger.info({
        logCode: 'audiomanager_mute_audio',
        extraInfo: { logType: actionType },
      }, 'microphone muted');
      Storage.setItem(storageKey, newMutedState);

      if (shouldRunLocalMute) AudioManager.mute();

      toggleVoice(Auth.userID as string, newMutedState);
    }
  };

  const parentMeetingId = meetingStaticStore?.breakoutPolicies.parentMeetingId || '';
  const isBreakout = meetingStaticStore?.isBreakout || false;

  const meetingId = isBreakout && parentMeetingId
    ? parentMeetingId
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
  toggleVoice: (userId: string, muted: boolean) => void,
) => {
  return toggleMuteMicrophoneDebounced(muted, toggleVoice);
};

// Debounce is not needed here, as this function should only called by the system.
export const toggleMuteMicrophoneSystem = (
  muted: boolean,
  toggleVoice: (userId: string, muted: boolean) => void,
) => {
  return toggleMute(muted, toggleVoice, 'system_action');
};

export const startPushToTalk = (toggleVoice: (userId: string, muted: boolean) => void) => {
  toggleMute(true, toggleVoice);
};

export const stopPushToTalk = (toggleVoice: (userId: string, muted: boolean) => void) => {
  toggleMute(false, toggleVoice);
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

const getSpeakerLevel = () => {
  const storageLevel = Storage.getItem(SPEAKER_LEVEL_KEY);

  if (storageLevel != null) return Number(storageLevel);

  return 1;
};

export const useSpeakerLevel = () => {
  const speakerLevel = useStorageKey(SPEAKER_LEVEL_KEY, 'session');

  if (speakerLevel != null) return Number(speakerLevel);

  return 1;
};

export const setSpeakerLevel = (level: number) => {
  // mediasoup/FS/bbb-webrtc-sfu volume changes happen here since there's a
  // global media element.
  // LiveKit handles volume changes per track - that happens as a side-effect
  // in livekit/component#RoomAudioRenderer
  const MEDIA_TAG = window.meetingClientSettings.public.media.mediaTag;
  const audioElement = document.querySelector(MEDIA_TAG) as HTMLMediaElement;

  // mediasoup/FS/bbb-webrtc-sfu only
  if (audioElement) audioElement.volume = level;

  Storage.setItem(SPEAKER_LEVEL_KEY, level);
};

export const muteAway = (
  muted: boolean,
  away: boolean,
  voiceToggle: (userId: string, muted: boolean) => void,
) => {
  const prevAwayMuted = Storage.getItem('prevAwayMuted') || false;
  const prevSpeakerLevelValue = Storage.getItem(PREV_SPEAKER_LEVEL_KEY) || 1;

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
      Storage.setItem(PREV_SPEAKER_LEVEL_KEY, getSpeakerLevel());
      setSpeakerLevel(0);
    }
  }

  // enable/disable video
  VideoService.setTrackEnabled(away);
};

export const isMutedAlertEnabled = () => {
  const { enabled = false } = window.meetingClientSettings.public.app.mutedAlert;
  return enabled;
};

export default {
  SPEAKER_LEVEL_KEY,
  handleLeaveAudio,
  toggleMuteMicrophone,
  truncateDeviceName,
  notify,
  liveChangeInputDevice,
  setSpeakerLevel,
  useSpeakerLevel,
  startPushToTalk,
  stopPushToTalk,
  isMutedAlertEnabled,
};

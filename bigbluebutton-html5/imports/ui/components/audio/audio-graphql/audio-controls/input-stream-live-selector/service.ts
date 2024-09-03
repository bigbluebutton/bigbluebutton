/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import getFromUserSettings from '/imports/ui/services/users-settings';
import Storage from '/imports/ui/services/storage/session';
import logger from '/imports/startup/client/logger';
import AudioManager from '/imports/ui/services/audio-manager';
import VideoService from '/imports/ui/components/video-provider/service';
import Auth from '/imports/ui/services/auth';
import { debounce } from '/imports/utils/debounce';
import { throttle } from '/imports/utils/throttle';
import apolloContextHolder from '/imports/ui/core/graphql/apolloContextHolder/apolloContextHolder';
import { MEETING_IS_BREAKOUT } from '/imports/ui/components/audio/audio-graphql/audio-controls/queries';

const MUTED_KEY = 'muted';
const DEVICE_LABEL_MAX_LENGTH = 40;
const CLIENT_DID_USER_SELECTED_MICROPHONE_KEY = 'clientUserSelectedMicrophone';
const CLIENT_DID_USER_SELECTED_LISTEN_ONLY_KEY = 'clientUserSelectedListenOnly';
const TOGGLE_MUTE_THROTTLE_TIME = 300;
const TOGGLE_MUTE_DEBOUNCE_TIME = 500;

export const handleLeaveAudio = (meetingIsBreakout: boolean) => {
  if (!meetingIsBreakout) {
    Storage.setItem(CLIENT_DID_USER_SELECTED_MICROPHONE_KEY, !!false);
    Storage.setItem(CLIENT_DID_USER_SELECTED_LISTEN_ONLY_KEY, !!false);
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

const toggleMute = (
  muted: boolean,
  toggleVoice: (userId: string, muted: boolean) => void,
  actionType = 'user_action',
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

  apolloContextHolder.getClient().query({
    query: MEETING_IS_BREAKOUT,
    fetchPolicy: 'cache-first',
  }).then((result) => {
    const meeting = result?.data?.meeting?.[0];
    const meetingId = meeting?.isBreakout && meeting?.breakoutPolicies?.parentId
      ? meeting.breakoutPolicies.parentId
      : Auth.meetingID;
    const storageKey = `${MUTED_KEY}_${meetingId}`;

    toggle(storageKey);
  }).catch(() => {
    // Fallback
    const storageKey = `${MUTED_KEY}_${Auth.meetingID}`;
    toggle(storageKey);
  });
};

const toggleMuteMicrophoneThrottled = throttle(toggleMute, TOGGLE_MUTE_THROTTLE_TIME);

const toggleMuteMicrophoneDebounced = debounce(toggleMuteMicrophoneThrottled, TOGGLE_MUTE_DEBOUNCE_TIME,
  { leading: true, trailing: false });

export const toggleMuteMicrophone = (muted: boolean, toggleVoice: (userId: string, muted: boolean) => void) => {
  return toggleMuteMicrophoneDebounced(muted, toggleVoice);
};

// Debounce is not needed here, as this function should only called by the system.
export const toggleMuteMicrophoneSystem = (muted: boolean, toggleVoice: (userId: string, muted: boolean) => void) => {
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
  toggleMuteMicrophoneSystem,
  truncateDeviceName,
  notify,
  liveChangeInputDevice,
  getSpeakerLevel,
  setSpeakerLevel,
  startPushToTalk,
  stopPushToTalk,
};

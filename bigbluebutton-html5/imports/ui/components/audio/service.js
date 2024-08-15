import Auth from '/imports/ui/services/auth';
import AudioManager from '/imports/ui/services/audio-manager';
import logger from '/imports/startup/client/logger';
import Storage from '../../services/storage/session';
import { useReactiveVar } from '@apollo/client';
import {
  getAudioConstraints,
  doGUM,
} from '/imports/api/audio/client/bridge/service';
import {
  toggleMuteMicrophone,
  toggleMuteMicrophoneSystem,
} from '/imports/ui/components/audio/audio-graphql/audio-controls/input-stream-live-selector/service';

const MUTED_KEY = 'muted';

const recoverMicState = (toggleVoice) => {
  const muted = Storage.getItem(MUTED_KEY);

  if ((muted === undefined) || (muted === null) || AudioManager.inputDeviceId === 'listen-only') {
    return;
  }

  logger.debug({
    logCode: 'audio_recover_mic_state',
  }, `Audio recover previous mic state: muted = ${muted}`);
  toggleVoice(Auth.userID, muted);
};

const audioEventHandler = (toggleVoice) => (event) => {
  if (!event) {
    return;
  }

  switch (event.name) {
    case 'started':
      if (!event.isListenOnly) recoverMicState(toggleVoice);
      break;
    default:
      break;
  }
};

const init = (messages, intl, toggleVoice, speechLocale, voiceConf, username) => {
  AudioManager.setAudioMessages(messages, intl);
  if (AudioManager.initialized) return Promise.resolve(false);
  const meetingId = Auth.meetingID;
  const userId = Auth.userID;
  const { sessionToken } = Auth;
  const voiceBridge = voiceConf;

  // FIX ME
  const microphoneLockEnforced = false;

  const userData = {
    meetingId,
    userId,
    sessionToken,
    username,
    voiceBridge,
    microphoneLockEnforced,
    speechLocale,
  };

  return AudioManager.init(userData, audioEventHandler(toggleVoice));
};

const useIsUsingAudio = () => {
  const isConnected = useReactiveVar(AudioManager._isConnected.value);
  const isConnecting = useReactiveVar(AudioManager._isConnecting.value);
  const isHangingUp = useReactiveVar(AudioManager._isHangingUp.value);
  const isEchoTest = useReactiveVar(AudioManager._isEchoTest.value);
  return Boolean(isConnected || isConnecting || isHangingUp || isEchoTest);
};

const hasMicrophonePermission = async ({
  permissionStatus,
  gumOnPrompt = false,
}) => {
  try {
    let status = permissionStatus;

    // If the browser doesn't support the Permissions API, we can't check
    // microphone permissions - return null (unknown)
    if (navigator?.permissions?.query == null) return null;

    if (!status) {
      ({ state: status } = await navigator.permissions.query({ name: 'microphone' }));
    }

    switch (status) {
      case 'denied':
        return false;
      case 'prompt':
        // Prompt without any subsequent action is considered unknown
        if (!gumOnPrompt) {
          return null;
        }

        return doGUM({ audio: getAudioConstraints() }).then((stream) => {
          stream.getTracks().forEach((track) => {
            track.stop();
            stream.removeTrack(track);
          });
          return true;
        }).catch((error) => {
          if (error.name === 'NotAllowedError') {
            return false;
          }

          // Give it the benefit of the doubt. It might be a device mismatch
          // or something else that's not a permissions issue, so let's try
          // to proceed. Rollbacks that happen downstream might fix the issue,
          // otherwise we'll land on the Help screen anyways
          return null;
        });

      case 'granted':
      default:
        return true;
    }
  } catch (error) {
    logger.error({
      logCode: 'audio_check_microphone_permission_error',
      extraInfo: {
        errorName: error.name,
        errorMessage: error.message,
      },
    }, `Error checking microphone permission: ${error.message}`);

    // Null = could not determine permission status
    return null;
  }
};

export default {
  init,
  exitAudio: () => AudioManager.exitAudio(),
  forceExitAudio: () => AudioManager.forceExitAudio(),
  transferCall: () => AudioManager.transferCall(),
  joinListenOnly: () => AudioManager.joinListenOnly(),
  joinMicrophone: (options) => AudioManager.joinMicrophone(options),
  joinEchoTest: () => AudioManager.joinEchoTest(),
  changeInputDevice: (inputDeviceId) => AudioManager.changeInputDevice(inputDeviceId),
  changeInputStream: (newInputStream) => { AudioManager.inputStream = newInputStream; },
  liveChangeInputDevice: (inputDeviceId) => AudioManager.liveChangeInputDevice(inputDeviceId),
  changeOutputDevice: (
    outputDeviceId,
    isLive,
  ) => AudioManager.changeOutputDevice(outputDeviceId, isLive),
  toggleMuteMicrophone,
  toggleMuteMicrophoneSystem,
  isConnectedToBreakout: () => {
    const transferStatus = AudioManager.getBreakoutAudioTransferStatus();
    if (transferStatus.status
      === AudioManager.BREAKOUT_AUDIO_TRANSFER_STATES.CONNECTED) return true;
    return false;
  },
  isConnected: () => {
    const transferStatus = AudioManager.getBreakoutAudioTransferStatus();
    if (!!transferStatus.breakoutMeetingId
      && transferStatus.breakoutMeetingId !== Auth.meetingID) return false;
    return AudioManager.isConnected;
  },
  isUsingAudio: () => AudioManager.isUsingAudio(),
  isConnecting: () => AudioManager.isConnecting,
  isListenOnly: () => AudioManager.isListenOnly,
  inputDeviceId: () => AudioManager.inputDeviceId,
  outputDeviceId: () => AudioManager.outputDeviceId,
  isEchoTest: () => AudioManager.isEchoTest,
  isMuted: () => AudioManager.isMuted,
  autoplayBlocked: () => AudioManager.autoplayBlocked,
  handleAllowAutoplay: () => AudioManager.handleAllowAutoplay(),
  playAlertSound: (url) => AudioManager.playAlertSound(url),
  updateAudioConstraints: (constraints) => AudioManager.updateAudioConstraints(constraints),
  recoverMicState,
  isReconnecting: () => AudioManager.isReconnecting,
  setBreakoutAudioTransferStatus: (status) => AudioManager
    .setBreakoutAudioTransferStatus(status),
  getBreakoutAudioTransferStatus: () => AudioManager
    .getBreakoutAudioTransferStatus(),
  getStats: () => AudioManager.getStats(),
  getAudioConstraints,
  doGUM,
  supportsTransparentListenOnly: () => AudioManager.supportsTransparentListenOnly(),
  hasMicrophonePermission,
  notify: (message, error, icon) => { AudioManager.notify(message, error, icon); },
  useIsUsingAudio,
};

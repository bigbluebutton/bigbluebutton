import Auth from '/imports/ui/services/auth';
import AudioManager from '/imports/ui/services/audio-manager';
import logger from '/imports/startup/client/logger';
import Storage from '../../services/storage/session';
import { useReactiveVar } from '@apollo/client';

const MUTED_KEY = 'muted';

const recoverMicState = (toggleVoice) => {
  const muted = Storage.getItem(MUTED_KEY);

  if ((muted === undefined) || (muted === null)) {
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

export default {
  init,
  exitAudio: () => AudioManager.exitAudio(),
  forceExitAudio: () => AudioManager.forceExitAudio(),
  transferCall: () => AudioManager.transferCall(),
  joinListenOnly: () => AudioManager.joinListenOnly(),
  joinMicrophone: () => AudioManager.joinMicrophone(),
  joinEchoTest: () => AudioManager.joinEchoTest(),
  changeInputDevice: (inputDeviceId) => AudioManager.changeInputDevice(inputDeviceId),
  changeInputStream: (newInputStream) => { AudioManager.inputStream = newInputStream; },
  liveChangeInputDevice: (inputDeviceId) => AudioManager.liveChangeInputDevice(inputDeviceId),
  changeOutputDevice: (
    outputDeviceId,
    isLive,
  ) => AudioManager.changeOutputDevice(outputDeviceId, isLive),
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
  isEchoTest: () => AudioManager.isEchoTest,
  autoplayBlocked: () => AudioManager.autoplayBlocked,
  handleAllowAutoplay: () => AudioManager.handleAllowAutoplay(),
  playAlertSound: (url) => AudioManager.playAlertSound(url),
  updateAudioConstraints:
    (constraints) => AudioManager.updateAudioConstraints(constraints),
  recoverMicState,
  isReconnecting: () => AudioManager.isReconnecting,
  setBreakoutAudioTransferStatus: (status) => AudioManager
    .setBreakoutAudioTransferStatus(status),
  getBreakoutAudioTransferStatus: () => AudioManager
    .getBreakoutAudioTransferStatus(),
  getStats: () => AudioManager.getStats(),
  notify: (message, error, icon) => { AudioManager.notify(message, error, icon); },
  useIsUsingAudio,
};

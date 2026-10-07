import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import logger from '/imports/startup/client/logger';
import { getStorageSingletonInstance } from '/imports/ui/services/storage';
import browserInfo from '/imports/utils/browserInfo';
import deviceInfo from '/imports/utils/deviceInfo';

const AUDIO_SESSION_NUM_KEY = 'AudioSessionNumber';
const DEFAULT_INPUT_DEVICE_ID = '';
const DEFAULT_OUTPUT_DEVICE_ID = '';
const INPUT_DEVICE_ID_KEY = 'audioInputDeviceId';
const OUTPUT_DEVICE_ID_KEY = 'audioOutputDeviceId';
// Chromium's virtual device ID that always resolves to the current OS
// default input/output device. Only meaningful on Blink-based desktop
// browsers - see getAudioConstraints() below.
const SYSTEM_DEFAULT_DEVICE_ID = 'default';

const getAudioSessionNumber = () => {
  let currItem = parseInt(sessionStorage.getItem(AUDIO_SESSION_NUM_KEY), 10);
  if (!currItem) {
    currItem = 0;
  }

  currItem += 1;
  sessionStorage.setItem(AUDIO_SESSION_NUM_KEY, currItem);
  return currItem;
};

const getCurrentAudioSessionNumber = () => sessionStorage.getItem(AUDIO_SESSION_NUM_KEY) || '0';

const reloadAudioElement = (audioElement) => {
  if (audioElement && (audioElement.readyState > 0)) {
    audioElement.load();
    return true;
  }

  return false;
};

const getCurrentAudioSinkId = () => {
  const MEDIA_TAG = window.meetingClientSettings.public.media.mediaTag;
  const audioElement = document.querySelector(MEDIA_TAG);
  return audioElement?.sinkId || DEFAULT_OUTPUT_DEVICE_ID;
};

const getStoredAudioOutputDeviceId = () => getStorageSingletonInstance()
  .getItem(OUTPUT_DEVICE_ID_KEY);
const storeAudioOutputDeviceId = (deviceId) => getStorageSingletonInstance()
  .setItem(OUTPUT_DEVICE_ID_KEY, deviceId);
const getStoredAudioInputDeviceId = () => getStorageSingletonInstance()
  .getItem(INPUT_DEVICE_ID_KEY);
const storeAudioInputDeviceId = (deviceId) => {
  if (deviceId === 'listen-only') {
    // Do not store listen-only "devices" and remove any stored device
    // So it starts from scratch next time.
    getStorageSingletonInstance().removeItem(INPUT_DEVICE_ID_KEY);

    return false;
  }

  getStorageSingletonInstance().setItem(INPUT_DEVICE_ID_KEY, deviceId);

  return true;
};

/**
 * Filter constraints set in audioDeviceConstraints, based on
 * constants supported by browser. This avoids setting a constraint
 * unsupported by browser. In currently safari version (13+), for example,
 * setting an unsupported constraint crashes the audio.
 * @param  {Object} audioDeviceConstraints Constraints to be set
 * see: https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
 * @return {Object}                        A new Object of the same type as
 * input, containing only the supported constraints.
 */
const filterSupportedConstraints = (audioDeviceConstraints) => {
  try {
    const matchConstraints = {};
    const supportedConstraints = navigator
      .mediaDevices.getSupportedConstraints() || {};
    Object.entries(audioDeviceConstraints).forEach(
      ([constraintName, constraintValue]) => {
        if (supportedConstraints[constraintName]) {
          matchConstraints[constraintName] = constraintValue;
        }
      },
    );

    return matchConstraints;
  } catch (error) {
    logger.error({
      logCode: 'audio_unsupported_constraint_error',
    }, 'Unsupported audio constraints');
    return {};
  }
};

const getAudioConstraints = (constraintFields = {}) => {
  const { deviceId = '' } = constraintFields;
  const Settings = getSettingsSingletonInstance();
  const userSettingsConstraints = Settings.application.microphoneConstraints;
  const audioDeviceConstraints = userSettingsConstraints
    || window.meetingClientSettings.public.app.defaultSettings.application.microphoneConstraints
    || {};

  const matchConstraints = filterSupportedConstraints(
    audioDeviceConstraints,
  );

  if (deviceId) {
    matchConstraints.deviceId = { exact: deviceId };
  } else if (browserInfo.isBlink && !deviceInfo.isMobile) {
    // Chrome (M123+) can prioritize a per-origin pinned capture device over
    // an omitted or "ideal" deviceId - see
    // https://groups.google.com/a/chromium.org/g/blink-dev/c/El5jaGnhVu4
    // An "exact" constraint is the only documented way to override that and
    // actually get the OS default device. Guarded to Blink desktop only: the
    // "default" virtual device only exists on Chromium, and on Firefox/Safari
    // this would throw OverconstrainedError. Mobile is excluded because it
    // was never affected (single microphone) and "default" is not guaranteed
    // to exist there.
    matchConstraints.deviceId = { exact: SYSTEM_DEFAULT_DEVICE_ID };
  }

  return matchConstraints;
};

const doGUM = async (constraints, retryOnFailure = false) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  } catch (error) {
    // This is probably a deviceId mismatch. Retry with base constraints
    // without an exact deviceId.
    const retryableErrors = ['NotFoundError', 'OverconstrainedError', 'NotReadableError'];

    if (retryOnFailure && retryableErrors.includes(error.name)) {
      logger.warn({
        logCode: 'audio_overconstrainederror_rollback',
        extraInfo: {
          constraints,
          errorName: error.name,
          errorMessage: error.message,
        },
      }, 'Audio getUserMedia returned OverconstrainedError, rollback');

      // The stored device is gone or never matched, so forget it. Otherwise
      // a forced "exact" deviceId (see getAudioConstraints()) keeps pinning
      // it on every later attempt. NotReadableError is left alone: the
      // device exists, it's just busy right now.
      if (error.name !== 'NotReadableError') {
        getStorageSingletonInstance().removeItem(INPUT_DEVICE_ID_KEY);
      }

      // Retry without the deviceId but keep the audio processing constraints
      // (AGC/echo cancellation/noise suppression). Falling back to
      // `{ audio: true }` would silently capture with the browser's defaults.
      const { deviceId, ...retryConstraints } = constraints?.audio ?? {};

      return navigator.mediaDevices.getUserMedia({
        audio: Object.keys(retryConstraints).length > 0 ? retryConstraints : true,
      });
    }

    // Not OverconstrainedError - bubble up the error.
    throw error;
  }
};

const isEnabled = () => window.meetingClientSettings.public.app.audioCaptions.enabled;

const getProvider = () => window.meetingClientSettings.public.app.audioCaptions.provider;

const isWebSpeechApi = () => getProvider() === 'webspeech';

const isVosk = () => getProvider() === 'vosk';

const isWhispering = () => getProvider() === 'whisper';

const isDeepSpeech = () => getProvider() === 'deepSpeech';

const isActive = () => isEnabled()
  && ((isWebSpeechApi()) || isVosk() || isWhispering() || isDeepSpeech());

const stereoUnsupported = () => isActive() && isVosk();

export {
  DEFAULT_INPUT_DEVICE_ID,
  DEFAULT_OUTPUT_DEVICE_ID,
  INPUT_DEVICE_ID_KEY,
  OUTPUT_DEVICE_ID_KEY,
  getAudioSessionNumber,
  getCurrentAudioSessionNumber,
  reloadAudioElement,
  filterSupportedConstraints,
  getAudioConstraints,
  getCurrentAudioSinkId,
  getStoredAudioInputDeviceId,
  storeAudioInputDeviceId,
  getStoredAudioOutputDeviceId,
  storeAudioOutputDeviceId,
  doGUM,
  stereoUnsupported,
};

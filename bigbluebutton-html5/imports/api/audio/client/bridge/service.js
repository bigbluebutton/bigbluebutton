import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import logger from '/imports/startup/client/logger';
import { getStorageSingletonInstance } from '/imports/ui/services/storage';
import {
  createWasmProcessorStream,
  isWasmProcessorSupported,
  loadWasmProcessorFiles,
  setWasmProcessorEnabled,
} from '/imports/ui/components/audio/audio-processor/service';

const AUDIO_SESSION_NUM_KEY = 'AudioSessionNumber';
const DEFAULT_INPUT_DEVICE_ID = '';
const DEFAULT_OUTPUT_DEVICE_ID = '';
const INPUT_DEVICE_ID_KEY = 'audioInputDeviceId';
const OUTPUT_DEVICE_ID_KEY = 'audioOutputDeviceId';

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
    if (audioElement.paused) {
      audioElement.play().catch((error) => {
        logger.error({
          logCode: 'audio_reload_element_play_error',
          extraInfo: {
            errorName: error.name,
            errorMessage: error.message,
          },
        }, 'Error playing audio element after reload');
      });
    }
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
    // NOTE using 'exact' here causes OverconstrainedError for systems with
    // dynamic device ids like PipeWire
    // prefer to use 'ideal' which can fallback to default device, allowing to keep constraints
    matchConstraints.deviceId = { ideal: deviceId };
  }

  return matchConstraints;
};

const isBBBAWasmSupported = () => {
  return isWasmProcessorSupported()
    && window.meetingClientSettings.public.media.audio.audioWasmProcessing;
};

// check if wasm processing is enabled
const isWasmProcessingEnabled = (localSettingsState) => {
  if (!isBBBAWasmSupported()) return false;

  const defaultSetting = window.meetingClientSettings.public.app.audioWasmProcessing;
  const Settings = getSettingsSingletonInstance();

  // Precedence: unconfirmed local user setttings -> local user setting
  // -> default setting -> false (for now until stable - prlanzarin Nov 2025)
  if (localSettingsState !== undefined) return localSettingsState;
  if (Settings.application.audioWasmProcessing !== undefined) {
    return Settings.application.audioWasmProcessing;
  }
  if (defaultSetting !== undefined) return defaultSetting;

  return false;
};

const loadWasmProcessor = async () => {
  if (isBBBAWasmSupported()) {
    try {
      await loadWasmProcessorFiles();
      return true;
    } catch (error) {
      logger.warn({
        logCode: 'audio_wasm_processor_load_failed',
        extraInfo: {
          errorMessage: error?.message,
          errorStack: error?.stack,
        },
      }, `loadWasmProcessorFiles failed: ${error?.message || 'unknown error'}`);
    }
  }

  return false;
};

const doGUM = async (constraints, retryOnFailure = false) => {
  let haveWasmProcessor = false;
  const wasmProcessingEnabled = isWasmProcessingEnabled();

  // We want only echo-cancel on top of WASM
  if (wasmProcessingEnabled) {
    haveWasmProcessor = await loadWasmProcessor();

    if (haveWasmProcessor) {
      const deviceId = constraints?.audio?.deviceId;
      // eslint-disable-next-line no-param-reassign
      constraints.audio = filterSupportedConstraints({
        echoCancellation: true,
        autoGainControl: false,
        noiseSuppression: false,
      });

      if (deviceId) {
        // eslint-disable-next-line no-param-reassign
        constraints.audio.deviceId = deviceId;
      }
    }
  }

  let stream;

  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
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

      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } else {
      // Not OverconstrainedError - bubble up the error.
      throw error;
    }
  }

  if (!haveWasmProcessor) {
    return stream;
  }

  try {
    const wasmProcessorStream = await createWasmProcessorStream(stream);
    setWasmProcessorEnabled(wasmProcessingEnabled);

    return wasmProcessorStream;
  } catch (error) {
    logger.warn({
      logCode: 'audio_wasm_processor_stream_failed',
      extraInfo: {
        errorMessage: error?.message,
        errorStack: error?.stack,
      },
    }, `createWasmProcessorStream failed: ${error?.message || 'unknown error'}`);

    return stream;
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
  isBBBAWasmSupported,
  isWasmProcessingEnabled,
};

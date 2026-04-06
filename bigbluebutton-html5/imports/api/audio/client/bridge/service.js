import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import logger from '/imports/startup/client/logger';
import { getStorageSingletonInstance } from '/imports/ui/services/storage';
import {
  adoptWasmProcessor,
  createWasmProcessorStream,
  destroyWasmProcessor,
  isWasmProcessorSupported,
  loadWasmProcessorFiles,
  setWasmProcessorEnabled,
} from '/imports/ui/components/audio/audio-processor/service';
import MediaStreamUtils from '/imports/utils/media-stream-utils';

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

  // Exact might fail, but any gUM procedure for audio should go through our
  // doGUM which handles OverConstrained fallbacks
  if (deviceId) matchConstraints.deviceId = { exact: deviceId };

  return matchConstraints;
};

const getWasmProcessingSettings = () => {
  const setting = window.meetingClientSettings.public.media.audio.audioWasmProcessing;

  // Backwards compat, remove later - prlanzarin
  if (typeof setting === 'boolean') return { enabled: setting };

  return setting || {};
};

const isBBBAWasmSupported = () => isWasmProcessorSupported()
  && getWasmProcessingSettings().enabled;

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

const doGUM = async (
  constraints, {
    adoptProcessorAsPrimary = true,
    retryOnFailure = false,
  } = {},
) => {
  let haveWasmProcessor = false;
  const wasmProcessingEnabled = isWasmProcessingEnabled();

  // We want only echo-cancel on top of WASM
  if (wasmProcessingEnabled) {
    haveWasmProcessor = await loadWasmProcessor();

    if (haveWasmProcessor) {
      // Extract the raw deviceId string from the constraint
      const deviceIdConstraint = constraints?.audio?.deviceId;
      const rawDeviceId = typeof deviceIdConstraint === 'object'
        ? (deviceIdConstraint?.exact || deviceIdConstraint?.ideal)
        : deviceIdConstraint;

      const { constraints: wasmConstraints } = getWasmProcessingSettings();
      const defaults = {
        echoCancellation: true,
        autoGainControl: true,
        noiseSuppression: true,
      };
      // eslint-disable-next-line no-param-reassign
      constraints.audio = filterSupportedConstraints({
        ...defaults,
        ...wasmConstraints,
      });

      if (rawDeviceId) {
        // Preserve the original constraint type. 'exact' forces the browser
        // Any fallback from overconstraining is handled later in this function
        const constraintType = deviceIdConstraint?.exact ? 'exact' : 'ideal';
        // eslint-disable-next-line no-param-reassign
        constraints.audio.deviceId = { [constraintType]: rawDeviceId };
      }

      logger.debug({
        logCode: 'audio_dogum_wasm_constraints',
        extraInfo: {
          constraints,
          haveWasmProcessor,
        },
      }, 'doGUM: resolved constraints for WASM processing');
    }
  }

  let stream;

  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    const retryableErrors = ['NotFoundError', 'OverconstrainedError', 'NotReadableError'];

    if (!retryableErrors.includes(error.name)) throw error;

    // If the deviceId was 'exact' and we got OverconstrainedError, relax to
    // 'ideal' before falling back further. This handles systems with dynamic
    // device IDs (e.g., PipeWire) where 'exact' may fail but 'ideal' can
    // still select the best available device.
    const exactDeviceId = constraints?.audio?.deviceId?.exact;

    if (exactDeviceId) {
      logger.warn({
        logCode: 'audio_dogum_exact_failed',
        extraInfo: {
          errorName: error.name,
          errorMessage: error.message,
          exactDeviceId,
        },
      }, `doGUM: exact deviceId failed (${error.name}), retrying with ideal`);

      try {
        const idealConstraints = {
          audio: { ...constraints.audio, deviceId: { ideal: exactDeviceId } },
        };
        stream = await navigator.mediaDevices.getUserMedia(idealConstraints);
      } catch (idealError) {
        if (!retryOnFailure) throw idealError;

        logger.warn({
          logCode: 'audio_dogum_ideal_failed',
          extraInfo: {
            errorName: idealError.name,
            errorMessage: idealError.message,
          },
        }, 'doGUM: ideal deviceId also failed, falling back to { audio: true }');

        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } else if (retryOnFailure) {
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
      throw error;
    }

    logger.warn({
      logCode: 'audio_dogum_fallback_gum',
      extraInfo: {
        streamData: MediaStreamUtils.getMediaStreamLogData(stream),
        wasmProcessingEnabled,
      },
    }, 'doGUM: fallback GUM succeeded');
  }

  logger.debug({
    logCode: 'audio_dogum_gum_result',
    extraInfo: {
      streamData: MediaStreamUtils.getMediaStreamLogData(stream),
      haveWasmProcessor,
    },
  }, 'Audio getUserMedia succeeded');

  if (!haveWasmProcessor) {
    return stream;
  }

  // Setup the WASM processor stream, but if it fails for any reason, just return
  // the original GUM stream so that audio can still work minimally.
  try {
    // Capture the REAL device ID from the GUM stream BEFORE WASM processing
    // replaces the tracks. The WASM-processed stream has synthetic WebAudio-*
    // device IDs that don't correspond to any real device.
    const realDeviceId = stream.getAudioTracks()[0]?.getSettings()?.deviceId;

    const wasmProcessorStream = await createWasmProcessorStream(stream);

    // Register the per-stream mapping from synthetic WebAudio-* device ID
    // to the real device ID for later resolution
    const syntheticDeviceId = wasmProcessorStream.getAudioTracks()[0]
      ?.getSettings()?.deviceId;
    MediaStreamUtils.registerWasmDeviceId(syntheticDeviceId, realDeviceId);

    // Promote this processor as the primary for runtime control
    // (setWasmProcessorEnabled/Parameter/Destruction). E.g.: preview calls (audio-settings
    // pass it false to avoid hijacking the main audioProcessor since they're transient
    if (adoptProcessorAsPrimary) adoptWasmProcessor(wasmProcessorStream);

    setWasmProcessorEnabled(wasmProcessingEnabled);
    logger.debug({
      logCode: 'audio_wasm_processor_stream_created',
      extraInfo: {
        originalStreamData: MediaStreamUtils.getMediaStreamLogData(stream),
        processedStreamData: MediaStreamUtils.getMediaStreamLogData(wasmProcessorStream),
        originalTrackDeviceId: realDeviceId ?? 'N/A',
        processedTrackDeviceId: wasmProcessorStream.getAudioTracks()[0]?.getSettings()?.deviceId ?? 'N/A',
        registeredRealDeviceId: realDeviceId ?? 'N/A',
      },
    }, 'Audio: createWasmProcessorStream succeeded');

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
  destroyWasmProcessor,
  stereoUnsupported,
  isBBBAWasmSupported,
  isWasmProcessingEnabled,
};

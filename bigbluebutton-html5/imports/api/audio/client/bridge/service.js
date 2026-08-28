import { getSettingsSingletonInstance, hasPersistedChange } from '/imports/ui/services/settings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import logger from '/imports/startup/client/logger';
import { getStorageSingletonInstance } from '/imports/ui/services/storage';
import {
  adoptWasmProcessor,
  createWasmProcessorStream,
  destroyWasmProcessor,
  getProviderForcedMicrophoneConstraints,
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
const AUDIO_PROCESSING_MODES = ['advanced', 'standard', 'original'];

const DISABLED_MICROPHONE_CONSTRAINTS = {
  autoGainControl: false,
  echoCancellation: false,
  noiseSuppression: false,
};

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

// First rung of doGUM()'s getUserMedia retry ladder: dropping deviceId (the
// usual cause) must not also silently reset
// echoCancellation/autoGainControl/noiseSuppression - including a
// provider's forcedMicrophoneConstraints - back to the browser's own
// defaults, which are `true` for all three in Firefox/Chrome/Safari alike.
const withoutDeviceIdConstraint = (audioConstraints) => {
  if (!audioConstraints || typeof audioConstraints !== 'object') return true;
  const { deviceId, ...rest } = audioConstraints;
  return rest;
};

// Last rung. media.audio.audioWasmProcessing.constraints and
// media.audio.microphoneConstraints are free-form admin config and may hold an
// exact/min/max value that is itself what overconstrained the request;
// filterSupportedConstraints() only checks that the browser knows the
// constraint name, not that the device can satisfy it. Keep only what the
// active provider hard-requires - and only when this call actually has a
// processor: getActiveProvider() is admin config and knows nothing about the
// current mode, so forcing e.g. workadventureDtln's noiseSuppression:false
// onto a plain 'standard'/'original' retry - or onto an 'advanced' call whose
// provider failed to load - would disable the browser's own suppression with
// no WASM model there to replace it. haveWasmProcessor, not the mode flag, is
// what gates the same constraints on the first attempt.
const forcedConstraintsOnly = (haveWasmProcessor) => {
  if (!haveWasmProcessor) return true;

  const forced = getProviderForcedMicrophoneConstraints();

  return Object.keys(forced || {}).length > 0 ? { ...forced } : true;
};

const getWasmProcessingSettings = () => {
  const setting = window.meetingClientSettings.public.media.audio.audioWasmProcessing;

  // Backwards compat, remove later - prlanzarin
  if (typeof setting === 'boolean') return { enabled: setting };

  return setting || {};
};

const isWasmProcessingConfigEnabled = () => !!getWasmProcessingSettings().enabled;

const isAdvancedProcessingSupported = () => isWasmProcessorSupported()
  && isWasmProcessingConfigEnabled();

// check if any browser-level audio filter constraint (AGC, echo cancellation,
// noise suppression) is enabled in the given microphone constraints
const isAudioFilterEnabled = (constraints) => {
  if (typeof constraints === 'undefined') return true;

  const isConstraintEnabled = (constraintValue) => {
    switch (typeof constraintValue) {
      case 'boolean':
        return constraintValue;
      case 'string':
        return constraintValue === 'true';
      case 'object':
        return !!(constraintValue.exact || constraintValue.ideal);
      default:
        return false;
    }
  };

  const normalizedConstraints = (constraints.advanced && typeof constraints.advanced === 'object')
    ? constraints.advanced
    : constraints;

  return !!Object.values(normalizedConstraints).find(isConstraintEnabled);
};

// 'standard' applies the browser-level filters configured in
// media.audio.microphoneConstraints (settings.yml). If left unset, no
// constraint is forced and the browser's own default takes over. 'advanced'
// and 'original' both disable every browser filter here: 'original' wants the
// raw signal, and 'advanced' relies on BBBA/WASM instead - once it loads,
// doGUM() overwrites these with media.audio.audioWasmProcessing.constraints
// ("on top of WASM"), so the all-false result below is only the baseline
// used before that override
const getConstraintsForMode = (mode) => {
  // Always return a new object. Main consumer for this is, at the end,
  // audio/container via a `useEffect`. If we return the same object, it never
  // fires and original <-> advanced switches become no-op; shallow comparison
  // shenanigans :)
  if (mode !== 'standard') return { ...DISABLED_MICROPHONE_CONSTRAINTS };

  return { ...(window.meetingClientSettings.public.media.audio.microphoneConstraints || {}) };
};

// Validates a mode and resolves it against actual browser support.
// Unknown values and unsupported 'advanced' both land on 'standard'.
const resolveAudioProcessingMode = (mode) => {
  const validMode = AUDIO_PROCESSING_MODES.includes(mode) ? mode : 'standard';

  if (validMode === 'advanced' && !isAdvancedProcessingSupported()) return 'standard';

  return validMode;
};

// Resolves defaultSettings.audio.processingMode (advanced/standard/original)
// against actual browser support. Only used as a last resort, when the user
// has made no choice of their own.
const getDefaultAudioProcessingMode = () => resolveAudioProcessingMode(
  window.meetingClientSettings.public.app.defaultSettings.audio.processingMode,
);

const getEffectiveAudioProcessingMode = () => {
  const Settings = getSettingsSingletonInstance();

  if (hasPersistedChange(SETTINGS.AUDIO, 'processingMode')) {
    return resolveAudioProcessingMode(Settings.audio.processingMode);
  }

  // backwards compatibility
  if (hasPersistedChange(SETTINGS.APPLICATION, 'audioWasmProcessing')) {
    return resolveAudioProcessingMode(
      isAudioFilterEnabled(Settings.application.microphoneConstraints) ? 'standard' : 'original',
    );
  }

  return getDefaultAudioProcessingMode();
};

const getAudioConstraints = (constraintFields = {}) => {
  const { deviceId = '' } = constraintFields;
  const Settings = getSettingsSingletonInstance();
  const configuredConstraints = window.meetingClientSettings.public
    .media.audio.microphoneConstraints;
  // Derive from the effective mode rather than the persisted constraints: an
  // 'advanced' pick that later loses WASM support resolves to 'standard', and
  // the all-false constraints it stored must not survive that coercion.
  // microphoneConstraints only speaks for a pre-4.0 record with no mode of
  // its own.
  const audioDeviceConstraints = hasPersistedChange(SETTINGS.AUDIO, 'processingMode')
    ? getConstraintsForMode(getEffectiveAudioProcessingMode())
    : Settings.application.microphoneConstraints
      || configuredConstraints
      || getConstraintsForMode(getEffectiveAudioProcessingMode());

  const matchConstraints = filterSupportedConstraints(
    audioDeviceConstraints,
  );

  // Exact might fail, but any gUM procedure for audio should go through our
  // doGUM which handles OverConstrained fallbacks
  if (deviceId) matchConstraints.deviceId = { exact: deviceId };

  return matchConstraints;
};

// check if wasm processing is enabled
const isWasmProcessingEnabled = () => getEffectiveAudioProcessingMode() === 'advanced';

const loadWasmProcessor = async () => {
  if (isAdvancedProcessingSupported()) {
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

// Retry without the device, then - if the remaining constraints are what the
// device cannot satisfy - without them either.
const retryWithoutDevice = async (audioConstraints, haveWasmProcessor) => {
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
  } catch (error) {
    if (error.name !== 'OverconstrainedError') throw error;

    logger.warn({
      logCode: 'audio_dogum_constraint_rollback',
      extraInfo: {
        errorName: error.name,
        errorMessage: error.message,
        constraint: error.constraint,
      },
    }, 'doGUM: retry still overconstrained, dropping configured constraints');

    return navigator.mediaDevices.getUserMedia({
      audio: forcedConstraintsOnly(haveWasmProcessor),
    });
  }
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
      // Some providers have a hard requirement on top of the admin's own
      // configured wasmConstraints (media.audio.audioWasmProcessing.constraints)
      // - e.g. the WorkAdventure/DTLN provider's docs ask for the browser's
      // own noiseSuppression to stay off so it doesn't double-process the
      // signal alongside the model. Merge these on top of the configured constraints.
      const forcedMicrophoneConstraints = getProviderForcedMicrophoneConstraints();
      // eslint-disable-next-line no-param-reassign
      constraints.audio = filterSupportedConstraints({
        ...defaults,
        ...wasmConstraints,
        ...forcedMicrophoneConstraints,
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

    const fallbackAudioConstraints = withoutDeviceIdConstraint(constraints?.audio);

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
            constraints,
            fallbackAudioConstraints,
          },
        }, 'doGUM: ideal deviceId also failed, falling back without a specific device');

        stream = await retryWithoutDevice(fallbackAudioConstraints, haveWasmProcessor);
      }
    } else if (retryOnFailure) {
      logger.warn({
        logCode: 'audio_overconstrainederror_rollback',
        extraInfo: {
          constraints,
          errorName: error.name,
          errorMessage: error.message,
          fallbackAudioConstraints,
        },
      }, 'Audio getUserMedia returned OverconstrainedError, rollback');

      stream = await retryWithoutDevice(fallbackAudioConstraints, haveWasmProcessor);
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
  isAdvancedProcessingSupported,
  isWasmProcessorSupported,
  isWasmProcessingConfigEnabled,
  isWasmProcessingEnabled,
  getConstraintsForMode,
  getEffectiveAudioProcessingMode,
};

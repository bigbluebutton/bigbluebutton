import Settings from '/imports/ui/services/settings';
import logger from '/imports/startup/client/logger';
import BBBStorage from '/imports/ui/services/storage';

const AUDIO_SESSION_NUM_KEY = 'AudioSessionNumber';
const DEFAULT_INPUT_DEVICE_ID = '';
const DEFAULT_OUTPUT_DEVICE_ID = '';
const INPUT_DEVICE_ID_KEY = 'audioInputDeviceId';
const OUTPUT_DEVICE_ID_KEY = 'audioOutputDeviceId';
const AUDIO_MICROPHONE_CONSTRAINTS = Meteor.settings.public.app.defaultSettings
  .application.microphoneConstraints;
const MEDIA_TAG = Meteor.settings.public.media.mediaTag;

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
  const audioElement = document.querySelector(MEDIA_TAG);
  return audioElement?.sinkId || DEFAULT_OUTPUT_DEVICE_ID;
};

const getStoredAudioInputDeviceId = () => BBBStorage.getItem(INPUT_DEVICE_ID_KEY);
const getStoredAudioOutputDeviceId = () => BBBStorage.getItem(OUTPUT_DEVICE_ID_KEY);
const storeAudioInputDeviceId = (deviceId) => BBBStorage.setItem(INPUT_DEVICE_ID_KEY, deviceId);
const storeAudioOutputDeviceId = (deviceId) => BBBStorage.setItem(OUTPUT_DEVICE_ID_KEY, deviceId);

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
  const userSettingsConstraints = Settings.application.microphoneConstraints;
  const audioDeviceConstraints = userSettingsConstraints
    || AUDIO_MICROPHONE_CONSTRAINTS || {};

  const matchConstraints = filterSupportedConstraints(
    audioDeviceConstraints,
  );

  if (deviceId) {
    matchConstraints.deviceId = { exact: deviceId };
  }

  return matchConstraints;
};

const doGUM = async (constraints, retryOnFailure = false) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  } catch (error) {
    // This is probably a deviceId mistmatch. Retry with base constraints
    // without an exact deviceId.
    if (error.name === 'OverconstrainedError' && retryOnFailure) {
      logger.warn({
        logCode: 'audio_overconstrainederror_rollback',
        extraInfo: {
          constraints,
        },
      }, 'Audio getUserMedia returned OverconstrainedError, rollback');

      return navigator.mediaDevices.getUserMedia({ audio: getAudioConstraints() });
    }

    // Not OverconstrainedError - bubble up the error.
    throw error;
  }
};

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
};

import Settings from '/imports/ui/services/settings';
import logger from '/imports/startup/client/logger';

const AUDIO_SESSION_NUM_KEY = 'AudioSessionNumber';
const DEFAULT_INPUT_DEVICE_ID = 'default';
const DEFAULT_OUTPUT_DEVICE_ID = 'default';
const INPUT_DEVICE_ID_KEY = 'audioInputDeviceId';
const OUTPUT_DEVICE_ID_KEY = 'audioOutputDeviceId';
const AUDIO_MICROPHONE_CONSTRAINTS = Meteor.settings.public.app.defaultSettings
  .application.microphoneConstraints;

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

const getAudioConstraints = ({ deviceId = '' }) => {
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
};

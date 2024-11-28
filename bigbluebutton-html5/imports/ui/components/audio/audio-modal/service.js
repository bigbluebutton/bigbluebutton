import Service from '../service';
import Storage from '/imports/ui/services/storage/session';

const CLIENT_DID_USER_SELECTED_MICROPHONE_KEY = 'clientUserSelectedMicrophone';
const CLIENT_DID_USER_SELECTED_LISTEN_ONLY_KEY = 'clientUserSelectedListenOnly';

export const setUserSelectedMicrophone = (value) => (
  Storage.setItem(CLIENT_DID_USER_SELECTED_MICROPHONE_KEY, !!value)
);

export const setUserSelectedListenOnly = (value) => (
  Storage.setItem(CLIENT_DID_USER_SELECTED_LISTEN_ONLY_KEY, !!value)
);

export const didUserSelectedMicrophone = () => (
  !!Storage.getItem(CLIENT_DID_USER_SELECTED_MICROPHONE_KEY)
);

export const didUserSelectedListenOnly = () => (
  !!Storage.getItem(CLIENT_DID_USER_SELECTED_LISTEN_ONLY_KEY)
);

export const joinMicrophone = (options = {}) => {
  const { skipEchoTest = false } = options;
  const shouldSkipEcho = skipEchoTest && Service.inputDeviceId() !== 'listen-only';

  Storage.setItem(CLIENT_DID_USER_SELECTED_MICROPHONE_KEY, true);
  Storage.setItem(CLIENT_DID_USER_SELECTED_LISTEN_ONLY_KEY, false);

  const {
    enabled: LOCAL_ECHO_TEST_ENABLED,
  } = window.meetingClientSettings.public.media.localEchoTest;

  const call = new Promise((resolve, reject) => {
    try {
      if ((shouldSkipEcho && !Service.isConnected()) || LOCAL_ECHO_TEST_ENABLED) {
        return resolve(Service.joinMicrophone(options));
      }

      return resolve(Service.transferCall());
    } catch {
      return reject(Service.exitAudio);
    }
  });

  return call.then(() => {
    document.dispatchEvent(new Event("CLOSE_MODAL_AUDIO"));
  }).catch((error) => {
    throw error;
  });
};

export const joinListenOnly = () => {
  Storage.setItem(CLIENT_DID_USER_SELECTED_MICROPHONE_KEY, false);
  Storage.setItem(CLIENT_DID_USER_SELECTED_LISTEN_ONLY_KEY, true);

  return Service.joinListenOnly().then(() => {
    // Autoplay block wasn't triggered. Close the modal. If autoplay was
    // blocked, that'll be handled in the modal component when then
    // prop transitions to a state where it was handled OR the user opts
    // to close the modal.
    if (!Service.autoplayBlocked()) {
      document.dispatchEvent(new Event("CLOSE_MODAL_AUDIO"));
    }
  }).catch((error) => {
    throw error;
  });
};

export const leaveEchoTest = () => {
  if (!Service.isEchoTest()) {
    return Promise.resolve();
  }
  return Service.exitAudio();
};

export const closeModal = (callback) => {
  const ALLOW_AUDIO_JOIN_CANCEL = window.meetingClientSettings.public.media.audio.allowAudioJoinCancel;

  if (Service.isConnecting()) {
    if (!ALLOW_AUDIO_JOIN_CANCEL) return;

    Service.forceExitAudio();
  }

  callback();
};

const getTroubleshootingLink = (errorCode) => {
  const TROUBLESHOOTING_LINKS = window.meetingClientSettings.public.media.audioTroubleshootingLinks;

  if (TROUBLESHOOTING_LINKS) return TROUBLESHOOTING_LINKS[errorCode] || TROUBLESHOOTING_LINKS[0];
  return null;
};

export default {
  joinMicrophone,
  closeModal,
  joinListenOnly,
  leaveEchoTest,
  didUserSelectedMicrophone,
  didUserSelectedListenOnly,
  getTroubleshootingLink,
};

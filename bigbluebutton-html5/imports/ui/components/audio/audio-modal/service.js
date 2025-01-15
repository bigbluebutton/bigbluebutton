import Service, {
  setUserSelectedMicrophone,
  setUserSelectedListenOnly,
} from '/imports/ui/components/audio/service';

export const joinMicrophone = (options = {}) => {
  const { skipEchoTest = false } = options;
  const shouldSkipEcho = skipEchoTest && Service.inputDeviceId() !== 'listen-only';

  setUserSelectedMicrophone(true);
  setUserSelectedListenOnly(false);

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
  setUserSelectedMicrophone(false);
  setUserSelectedListenOnly(true);

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
  getTroubleshootingLink,
};

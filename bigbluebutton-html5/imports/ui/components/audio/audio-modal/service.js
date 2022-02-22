import { showModal } from '/imports/ui/components/modal/service';
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

export const joinMicrophone = (skipEchoTest = false) => {
  const call = new Promise((resolve, reject) => {
    try {
      if (skipEchoTest && !Service.isConnected()) {
        return resolve(Service.joinMicrophone());
      }

      return resolve(Service.transferCall());
    } catch {
      return reject(Service.exitAudio);
    }
  });

  return call.then(() => {
    showModal(null);
  }).catch((error) => {
    throw error;
  });
};

export const joinListenOnly = () => {
  const call = new Promise((resolve) => {
    Service.joinListenOnly().then(() => {
      // Autoplay block wasn't triggered. Close the modal. If autoplay was
      // blocked, that'll be handled in the modal component when then
      // prop transitions to a state where it was handled OR the user opts
      // to close the modal.
      if (!Service.autoplayBlocked()) {
        showModal(null);
      }
      resolve();
    });
  });
  return call.catch((error) => {
    throw error;
  });
};

export const leaveEchoTest = () => {
  if (!Service.isEchoTest()) {
    return Promise.resolve();
  }
  return Service.exitAudio();
};

export const closeModal = () => {
  if (Service.isConnecting()) {
    Service.forceExitAudio();
  }
  showModal(null);
};

/**
 * Helper function that join (or not) user in audio. If user previously
 * selected microphone, it will automatically join mic (without audio modal).
 * If user previously selected listen only option in audio modal, then it will
 * automatically join listen only.
 * @returns a Promise for the audio joining process.
 */
export const joinAudioAutomatically = async () => {
  if (Service.isConnected()) return Promise.resolve();

  if (didUserSelectedMicrophone()) return joinMicrophone(true);

  if (didUserSelectedListenOnly()) return joinListenOnly();

  return Promise.resolve();
};

export default {
  joinMicrophone,
  closeModal,
  joinListenOnly,
  leaveEchoTest,
  joinAudioAutomatically,
};

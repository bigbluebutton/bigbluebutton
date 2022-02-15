import { showModal } from '/imports/ui/components/common/modal/service';
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
  Storage.setItem(CLIENT_DID_USER_SELECTED_MICROPHONE_KEY, true);
  Storage.setItem(CLIENT_DID_USER_SELECTED_LISTEN_ONLY_KEY, false);

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
  Storage.setItem(CLIENT_DID_USER_SELECTED_MICROPHONE_KEY, false);
  Storage.setItem(CLIENT_DID_USER_SELECTED_LISTEN_ONLY_KEY, true);

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

export default {
  joinMicrophone,
  closeModal,
  joinListenOnly,
  leaveEchoTest,
  didUserSelectedMicrophone,
  didUserSelectedListenOnly,
};

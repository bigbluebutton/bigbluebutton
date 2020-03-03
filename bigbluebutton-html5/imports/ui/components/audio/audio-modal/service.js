import { showModal } from '/imports/ui/components/modal/service';
import Service from '../service';
import AppService from '/imports/ui/components/app/service';

export const getcookieData = () => {
  const cookiesString = document.cookie;
  const cookies = cookiesString.split(';');
  const cookiesKeyValue = cookies.reduce((acc, value) => {
    if (!value) return acc;
    const splitValue = value.trim().split('=');
    return {
      ...acc,
      [splitValue[0]]: splitValue[1],
    };
  }, {});
  return cookiesKeyValue;
};

export const setCookieData = (name, value, daysToExpire = 1) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToExpire);
  document.cookie = `${name}=${value};expires=${date.toUTCString()}`;
};

export const invalidateCookie = (name) => {
  const cookies = getcookieData();
  if (cookies[name]) {
    // set the expires date to current date invalid the cookie
    setCookieData(name, false, 0);
    return true;
  }
  return false;
};

export const joinMicrophone = (skipEchoTest = false, changeInputDevice = false) => {
  const meetingIsBreakout = AppService.meetingIsBreakout();

  const call = new Promise((resolve, reject) => {
    if (skipEchoTest) {
      resolve(Service.joinMicrophone());
    } else {
      resolve(Service.transferCall());
    }
    reject(Service.exitAudio);
  });

  return call.then(() => {
    const { inputAudioId } = getcookieData();

    if (changeInputDevice && inputAudioId) {
      Service.changeInputDevice(inputAudioId);
    }

    if (!meetingIsBreakout) {
      const inputDeviceId = Service.inputDeviceId();
      setCookieData('joinedAudio', true, 1);
      setCookieData('inputAudioId', inputDeviceId, 1);
    }
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
  if (!Service.isConnecting()) showModal(null);
};

export default {
  joinMicrophone,
  closeModal,
  joinListenOnly,
  leaveEchoTest,
};

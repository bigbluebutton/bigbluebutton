const promiseTimeout = (ms, promise) => {
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);

      const error = {
        name: 'TimeoutError',
        message: 'Promise did not return',
      };

      reject(error);
    }, ms);
  });

  return Promise.race([
    promise,
    timeout,
  ]);
};

export default {
  promiseTimeout,
  changeWebcam: (deviceId) => {
    Session.set('WebcamDeviceId', deviceId);
  },
  webcamDeviceId: () => Session.get('WebcamDeviceId'),
  changeProfile: (profileId) => {
    Session.set('WebcamProfileId', profileId);
  },
};

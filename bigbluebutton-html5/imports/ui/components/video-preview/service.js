export default {
  changeWebcam: (deviceId) => {
    Session.set('WebcamDeviceId', deviceId);
  },
};


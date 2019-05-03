export default {
  changeWebcam: (deviceId) => {
    Session.set('WebcamDeviceId', deviceId);
  },
  webcamDeviceId: () => Session.get('WebcamDeviceId'),
  changeProfile: (profileId) => {
    Session.set('WebcamProfileId', profileId);
  },
};

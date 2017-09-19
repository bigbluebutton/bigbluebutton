import { makeCall } from '/imports/ui/services/api';

const sendUserShareWebcam = (stream) => {
  makeCall('userShareWebcam', stream);
};

const sendUserUnshareWebcam = (stream) => {
  makeCall('userUnshareWebcam', stream);
};

export default {
  sendUserShareWebcam, sendUserUnshareWebcam,
};

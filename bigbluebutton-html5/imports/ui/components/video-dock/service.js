import { makeCall } from '/imports/ui/services/api';

const joinVideo = () => {
  var joinVideoEvent = new Event('joinVideo');
  document.dispatchEvent(joinVideoEvent);
}

const exitVideo = () => {
  var exitVideoEvent = new Event('exitVideo');
  document.dispatchEvent(exitVideoEvent);
}

const sendUserShareWebcam = (stream) => {
  makeCall('userShareWebcam', stream);
};

const sendUserUnshareWebcam = (stream) => {
  makeCall('userUnshareWebcam', stream);
};

export default {
  sendUserShareWebcam, sendUserUnshareWebcam, joinVideo, exitVideo,
};

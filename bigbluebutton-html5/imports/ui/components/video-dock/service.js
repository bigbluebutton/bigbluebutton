import { makeCall } from '/imports/ui/services/api';
import Users from '/imports/api/users';

const joinVideo = () => {
  const joinVideoEvent = new Event('joinVideo');
  document.dispatchEvent(joinVideoEvent);
};

const exitVideo = () => {
  const exitVideoEvent = new Event('exitVideo');
  document.dispatchEvent(exitVideoEvent);
};

const sendUserShareWebcam = (stream) => {
  makeCall('userShareWebcam', stream);
};

const sendUserUnshareWebcam = (stream) => {
  makeCall('userUnshareWebcam', stream);
};

const getAllUsers = () => Users.find().fetch();

export default {
  sendUserShareWebcam, sendUserUnshareWebcam, joinVideo, exitVideo, getAllUsers,
};

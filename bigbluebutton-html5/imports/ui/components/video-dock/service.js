import { makeCall } from '/imports/ui/services/api';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';

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

const userId = Auth.userID;

export default {
  sendUserShareWebcam, sendUserUnshareWebcam, joinVideo, exitVideo, getAllUsers,
  userId,
};

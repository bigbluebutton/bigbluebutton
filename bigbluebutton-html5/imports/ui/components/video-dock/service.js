import { makeCall } from '/imports/ui/services/api';
import Users from '/imports/api/users';
import { createContainer } from 'meteor/react-meteor-data';

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

const getAllUsers = () => {
  return Users.find().fetch();
}

export default {
  sendUserShareWebcam, sendUserUnshareWebcam, joinVideo, exitVideo, getAllUsers,
};

import { callServer } from '/imports/ui/services/api';
import Auth from '/imports/ui/services/auth';

const sendUserShareWebcam = () => {
  callServer('userShareWebcam');
};

const sendUserUnshareWebcam = () => {
  callServer('userUnshareWebcam');
};

export default {
  sendUserShareWebcam, sendUserUnshareWebcam,
};

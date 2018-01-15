import { Tracker } from 'meteor/tracker';
import { makeCall } from '/imports/ui/services/api';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';

class VideoService {
  constructor() {
    this.defineProperties({
      isConnected: false,
      isWaitingResponse: false,
    });
  }

  defineProperties(obj) {
    Object.keys(obj).forEach((key) => {
      const privateKey = `_${key}`;
      this[privateKey] = {
        value: obj[key],
        tracker: new Tracker.Dependency(),
      };

      Object.defineProperty(this, key, {
        set: (value) => {
          this[privateKey].value = value;
          this[privateKey].tracker.changed();
        },
        get: () => {
          this[privateKey].tracker.depend();
          return this[privateKey].value;
        },
      });
    });
  }

  joinVideo() {
    var joinVideoEvent = new Event('joinVideo');
    document.dispatchEvent(joinVideoEvent);
  }

  joiningVideo() {
    this.isWaitingResponse = true;
  }

  joinedVideo() {
    this.isWaitingResponse = false;
    this.isConnected = true;
  }

  exitVideo() {
    var exitVideoEvent = new Event('exitVideo');
    document.dispatchEvent(exitVideoEvent);
  }

  exitingVideo() {
    this.isWaitingResponse = true;
  }

  exitedVideo() {
    this.isWaitingResponse = false;
    this.isConnected = false;
  }

  resetState() {
    this.isWaitingResponse = false;
    this.isConnected = false;
  }

  sendUserShareWebcam(stream) {
    makeCall('userShareWebcam', stream);
  }

  sendUserUnshareWebcam(stream) {
    makeCall('userUnshareWebcam', stream);
  }

  getAllUsers() {
    return Users.find().fetch();
  }

  userId() {
    return Auth.userID;
  }

  isConnected() {
    return this.isConnected;
  }

  isWaitingResponse() {
    return this.isWaitingResponse;
  }
}

const videoService = new VideoService();

export default {
  exitVideo: () => videoService.exitVideo(),
  exitingVideo: () => videoService.exitingVideo(),
  exitedVideo: () => videoService.exitedVideo(),
  getAllUsers: () => videoService.getAllUsers(),
  isConnected: () => videoService.isConnected,
  isWaitingResponse: () => videoService.isWaitingResponse,
  joinVideo: () => videoService.joinVideo(),
  joiningVideo: () => videoService.joiningVideo(),
  joinedVideo: () => videoService.joinedVideo(),
  resetState: () => videoService.resetState(),
  sendUserShareWebcam: (stream) => videoService.sendUserShareWebcam(stream),
  sendUserUnshareWebcam: (stream) => videoService.sendUserUnshareWebcam(stream),
  userId: () => videoService.userId(),
};

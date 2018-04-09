import { Tracker } from 'meteor/tracker';
import { makeCall } from '/imports/ui/services/api';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings/';
import Auth from '/imports/ui/services/auth';
import UserListService from '/imports/ui/components/user-list/service';

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
    const joinVideoEvent = new Event('joinVideo');
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
    const exitVideoEvent = new Event('exitVideo');
    document.dispatchEvent(exitVideoEvent);
  }

  exitedVideo() {
    this.isWaitingResponse = false;
    this.isConnected = false;
  }

  sendUserShareWebcam(stream) {
    makeCall('userShareWebcam', stream);
  }

  sendUserUnshareWebcam(stream) {
    this.isWaitingResponse = true;
    makeCall('userUnshareWebcam', stream);
  }

  getAllUsers() {
    // Use the same function as the user-list to share the sorting/mapping
    return UserListService.getUsers();
  }

  webcamOnlyModerator() {
    const m = Meetings.findOne({ meetingId: Auth.meetingID });
    return m.usersProp.webcamsOnlyForModerator;
  }

  isLocked() {
    const m = Meetings.findOne({ meetingId: Auth.meetingID });
    return m.lockSettingsProp ? m.lockSettingsProp.disableCam : false;
  }

  userId() {
    return Auth.userID;
  }

  meetingId() {
    return Auth.meetingID;
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
  webcamOnlyModerator: () => videoService.webcamOnlyModerator(),
  isLocked: () => videoService.isLocked(),
  isConnected: () => videoService.isConnected,
  isWaitingResponse: () => videoService.isWaitingResponse,
  joinVideo: () => videoService.joinVideo(),
  joiningVideo: () => videoService.joiningVideo(),
  joinedVideo: () => videoService.joinedVideo(),
  sendUserShareWebcam: stream => videoService.sendUserShareWebcam(stream),
  sendUserUnshareWebcam: stream => videoService.sendUserUnshareWebcam(stream),
  userId: () => videoService.userId(),
  meetingId: () => videoService.meetingId(),
};

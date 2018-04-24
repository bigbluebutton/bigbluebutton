import { Tracker } from 'meteor/tracker';
import { makeCall } from '/imports/ui/services/api';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings/';
import Users from '/imports/api/users/';
import mapUser from '/imports/ui/services/user/mapUser';
import UserListService from '/imports/ui/components/user-list/service';
import SessionStorage from '/imports/ui/services/storage/session';

class VideoService {
  constructor() {
    const enableVideo = Meteor.settings.public.kurento.enableVideo;
    const autoShareWebcam = SessionStorage.getItem('meta_html5autosharewebcam') || false;

    this.defineProperties({
      isSharing: autoShareWebcam && enableVideo,
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
    this.isSharing = true;
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
    console.warn('exitedVideo');
    this.isSharing = false;
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
    // Use the same function as the user-list to share the sorting/mapping
    return UserListService.getUsers();
  }

  getAllUsersVideo() {
    const userId = this.userId();
    const isLocked = this.isLocked();
    const currentUser = Users.findOne({ userId });
    const currentUserIsModerator = mapUser(currentUser).isModerator;
    const sharedWebcam = this.isSharing;

    const isSharingWebcam = user => user.isSharingWebcam || (sharedWebcam && user.isCurrent);
    const isNotLocked = user => !(isLocked && user.isLocked);

    const isWebcamOnlyModerator = this.webcamOnlyModerator();
    const allowedSeeViewersWebcams = !isWebcamOnlyModerator || currentUserIsModerator;
    const webcamOnlyModerator = (user) => {
      if (allowedSeeViewersWebcams) return true;
      return user.isModerator || user.isCurrent;
    };

    return this.getAllUsers()
      .filter(isSharingWebcam)
      .filter(isNotLocked)
      .filter(webcamOnlyModerator);
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
  isSharing: () => videoService.isSharing,
  isConnected: () => videoService.isConnected,
  isWaitingResponse: () => videoService.isWaitingResponse,
  joinVideo: () => videoService.joinVideo(),
  joiningVideo: () => videoService.joiningVideo(),
  joinedVideo: () => videoService.joinedVideo(),
  sendUserShareWebcam: stream => videoService.sendUserShareWebcam(stream),
  sendUserUnshareWebcam: stream => videoService.sendUserUnshareWebcam(stream),
  userId: () => videoService.userId(),
  meetingId: () => videoService.meetingId(),
  getAllUsersVideo: () => videoService.getAllUsersVideo(),
};

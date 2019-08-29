import { Tracker } from 'meteor/tracker';
import { makeCall } from '/imports/ui/services/api';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings/';
import Users from '/imports/api/users/';
import UserListService from '/imports/ui/components/user-list/service';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
const ROLE_VIEWER = Meteor.settings.public.user.role_viewer;

class VideoService {
  constructor() {
    this.defineProperties({
      isSharing: false,
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

  getAllWebcamUsers() {
    const webcamsLocked = this.webcamsLocked();
    const webcamsOnlyForModerator = this.webcamsOnlyForModerator();
    const hideUserList = this.hideUserList();
    const currentUser = Users.findOne({ userId: Auth.userID });
    const currentUserIsViewer = currentUser.role === ROLE_VIEWER;
    const sharedWebcam = this.isSharing;

    let users = Users
      .find({
        meetingId: Auth.meetingID,
        connectionStatus: 'online',
        hasStream: true,
        userId: { $ne: Auth.userID },
      })
      .fetch();

    const userIsNotLocked = user => user.role === ROLE_MODERATOR || !user.locked;

    if (webcamsLocked) {
      users = users.filter(userIsNotLocked);
    }

    const userIsModerator = user => user.role === ROLE_MODERATOR;

    if ((webcamsOnlyForModerator || hideUserList) && currentUserIsViewer) {
      users = users.filter(userIsModerator);
    }

    if (sharedWebcam) {
      users.unshift(currentUser);
    }

    return users.sort(UserListService.sortUsers);
  }

  webcamsOnlyForModerator() {
    const m = Meetings.findOne({ meetingId: Auth.meetingID },
      { fields: { 'usersProp.webcamsOnlyForModerator': 1 } });
    return m.usersProp ? m.usersProp.webcamsOnlyForModerator : false;
  }

  webcamsLocked() {
    const m = Meetings.findOne({ meetingId: Auth.meetingID },
      { fields: { 'lockSettingsProps.disableCam': 1 } });
    return m.lockSettingsProps ? m.lockSettingsProps.disableCam : false;
  }

  hideUserList() {
    const m = Meetings.findOne({ meetingId: Auth.meetingID },
      { fields: { 'lockSettingsProps.hideUserList': 1 } });
    return m.lockSettingsProps ? m.lockSettingsProps.hideUserList : false;
  }

  userId() {
    return Auth.userID;
  }

  userName() {
    const currentUser = Users.findOne({ userId: Auth.userID }, { fields: { name: 1 } });
    return currentUser.name;
  }

  meetingId() {
    return Auth.meetingID;
  }

  sessionToken() {
    return Auth.sessionToken;
  }

  voiceBridge() {
    const m = Meetings.findOne({ meetingId: Auth.meetingID },
      { fields: { 'voiceProp.voiceConf': 1 } });
    return m.voiceProp ? m.voiceProp.voiceConf : null;
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
  webcamsLocked: () => videoService.webcamsLocked(),
  webcamOnlyModerator: () => videoService.webcamOnlyModerator(),
  isSharing: () => videoService.isSharing,
  isConnected: () => videoService.isConnected,
  isWaitingResponse: () => videoService.isWaitingResponse,
  joinVideo: () => videoService.joinVideo(),
  joiningVideo: () => videoService.joiningVideo(),
  joinedVideo: () => videoService.joinedVideo(),
  sendUserShareWebcam: stream => videoService.sendUserShareWebcam(stream),
  sendUserUnshareWebcam: stream => videoService.sendUserUnshareWebcam(stream),
  userName: () => videoService.userName(),
  meetingId: () => videoService.meetingId(),
  getAllWebcamUsers: () => videoService.getAllWebcamUsers(),
  sessionToken: () => videoService.sessionToken(),
  voiceBridge: () => videoService.voiceBridge(),
};

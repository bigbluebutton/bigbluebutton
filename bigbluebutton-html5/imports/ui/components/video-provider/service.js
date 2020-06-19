import { Tracker } from 'meteor/tracker';
import { makeCall } from '/imports/ui/services/api';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings/';
import Users from '/imports/api/users/';
import VideoStreams from '/imports/api/video-streams/';
import UserListService from '/imports/ui/components/user-list/service';
import getFromUserSettings from '/imports/ui/services/users-settings';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
const ROLE_VIEWER = Meteor.settings.public.user.role_viewer;
const MIRROR_WEBCAM = Meteor.settings.public.app.mirrorOwnWebcam;

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
    const currentUser = Users.findOne({ userId: Auth.userID });
    const currentUserIsViewer = currentUser.role === ROLE_VIEWER;
    const sharedWebcam = this.isSharing;
    const videoStreams = VideoStreams.find({ meetingId: Auth.meetingID },
      { fields: { userId: 1 } }).fetch();

    const videoUserIds = videoStreams.map(u => u.userId);

    let users = Users
      .find({
        meetingId: Auth.meetingID,
        connectionStatus: 'online',
        $and: [
          { userId: { $ne: Auth.userID } },
          { userId: { $in: videoUserIds } },
        ],
      },
      {
        fields: {
          name: 1,
          userId: 1,
          role: 1,
          emoji: 1,
          clientType: 1,
        },
      }).fetch();

    const userIsNotLocked = user => user.role === ROLE_MODERATOR || !user.locked;

    if (webcamsLocked) {
      users = users.filter(userIsNotLocked);
    }

    const userIsModerator = user => user.role === ROLE_MODERATOR;

    if ((webcamsOnlyForModerator) && currentUserIsViewer) {
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

  mirrorOwnWebcam(user) {
    // only true if setting defined and video ids match
    const isOwnWebcam = user ? this.userId() === user.userId : true;
    const isEnabledMirroring = getFromUserSettings('bbb_mirror_own_webcam', MIRROR_WEBCAM);
    return isOwnWebcam && isEnabledMirroring;
  }

  userId() {
    return Auth.userID;
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
  mirrorOwnWebcam: user => videoService.mirrorOwnWebcam(user),
  meetingId: () => videoService.meetingId(),
  getAllWebcamUsers: () => videoService.getAllWebcamUsers(),
  sessionToken: () => videoService.sessionToken(),
  voiceBridge: () => videoService.voiceBridge(),
};

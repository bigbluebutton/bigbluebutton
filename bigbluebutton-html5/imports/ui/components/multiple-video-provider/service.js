import { Tracker } from 'meteor/tracker';
import { Session } from 'meteor/session';
import { makeCall } from '/imports/ui/services/api';
import { notify } from '/imports/ui/services/notification';
import Settings from '/imports/ui/services/settings';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import VideoStreams from '/imports/api/video-streams';
import UserListService from '/imports/ui/components/user-list/service';
import logger from '/imports/startup/client/logger';

const CAMERA_PROFILES = Meteor.settings.public.kurento.cameraProfiles;

const SFU_URL = Meteor.settings.public.kurento.wsUrl;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const isModerator = user => user.role === ROLE_MODERATOR;
const isNotLocked = user => isModerator(user) || !user.locked;

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
    this.isSharing = false;
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

  sharingWebcam() {
    // TODO: Check if waiting response is needed here
    return this.isSharing || this.isConnected;
  }

  sendUserShareWebcam(cameraId) {
    makeCall('userShareWebcam', cameraId);
  }

  sendUserUnshareWebcam(cameraId) {
    Session.set('userWasInWebcam', true);
    makeCall('userUnshareWebcam', cameraId);
  }

  getAuthenticatedURL() {
    return Auth.authenticateURL(SFU_URL);
  }

  getAllWebcamUsers() {
    const localUser = Users.findOne(
      { userId: Auth.userID },
      { fields: { name: 1, userId: 1, role: 1, locked: 1 } }
    );

    const videoUsers = VideoStreams.find(
      { meetingId: Auth.meetingID },
      { fields: { userId: 1 } }
    ).fetch().map(u => u.userId);

    let users = Users.find({
      meetingId: Auth.meetingID,
      connectionStatus: 'online',
      $and: [
        { userId: { $ne: localUser.userId } },
        { userId: { $in: videoUsers } },
      ],
    }, { fields: { name: 1, userId: 1, role: 1, locked: 1, } }).fetch();

    if (this.isSharing || this.isConnected) {
      users.push(localUser);
    }

    if (this.disableCam()) {
      users = users.filter(isNotLocked);
    }

    if (this.webcamsOnlyForModerator() || this.hideUserList()) {
      users = users.filter(isModerator);
    }

    return users.map(u => {
      return { userId: u.userId, name: u.name };
    }).sort(UserListService.sortUsersByName);
  }

  hasVideoStream() {
    const videoStreams = VideoStreams.findOne({ userId: Auth.userID },
      { fields: {} });
    return !!videoStreams;
  }

  webcamsOnlyForModerator() {
    const m = Meetings.findOne({ meetingId: Auth.meetingID },
      { fields: { 'usersProp.webcamsOnlyForModerator': 1 } });
    return m.usersProp ? m.usersProp.webcamsOnlyForModerator : false;
  }

  disableCam() {
    const m = Meetings.findOne({ meetingId: Auth.meetingID },
      { fields: { 'lockSettingsProps.disableCam': 1 } });
    return m.lockSettingsProps ? m.lockSettingsProps.disableCam : false;
  }

  hideUserList() {
    const m = Meetings.findOne({ meetingId: Auth.meetingID },
      { fields: { 'lockSettingsProps.hideUserList': 1 } });
    return m.lockSettingsProps ? m.lockSettingsProps.hideUserList : false;
  }

  getInfo() {
    const m = Meetings.findOne({ meetingId: Auth.meetingID },
      { fields: { 'voiceProp.voiceConf': 1 } });
    const voiceBridge = m.voiceProp ? m.voiceProp.voiceConf : null;
    return {
      userId: Auth.userID,
      userName: Auth.fullname,
      meetingId: Auth.meetingID,
      sessionToken: Auth.sessionToken,
      voiceBridge,
    }
  }

  userIsLocked() {
    return !!Users.findOne({
      userId: Auth.userID,
      locked: true,
      role: { $ne: ROLE_MODERATOR },
    }, { fields: {} }) && this.disableCam();
  }

  userGotLocked() {
    if (this.isConnected) {
      this.exitVideo();
    }
  }

  isConnected() {
    return this.isConnected;
  }

  isWaitingResponse() {
    return this.isWaitingResponse;
  }

  isLocalStream(cameraId) {
    return cameraId.startsWith(Auth.userID);
  }

  playStart(cameraId) {
    if (this.isLocalStream(cameraId)) {
      this.sendUserShareWebcam(cameraId);
      this.joinedVideo();
    }
  }

  getCameraProfile() {
    const profileId = Session.get('WebcamProfileId') || '';
    const cameraProfile = CAMERA_PROFILES.find(profile => profile.id === profileId)
      || CAMERA_PROFILES.find(profile => profile.default)
      || CAMERA_PROFILES[0];
    if (Session.get('WebcamDeviceId')) {
      cameraProfile.constraints = cameraProfile.constraints || {};
      cameraProfile.constraints.deviceId = { exact: Session.get('WebcamDeviceId') };
    }

    return cameraProfile;
  }

  addCandidateToPeer(peer, candidate, cameraId) {
    peer.addIceCandidate(candidate, (error) => {
      if (error) {
        // Just log the error. We can't be sure if a candidate failure on add is
        // fatal or not, so that's why we have a timeout set up for negotiations
        // and listeners for ICE state transitioning to failures, so we won't
        // act on it here
        logger.error({
          logCode: 'video_provider_addicecandidate_error',
          extraInfo: {
            cameraId,
            error,
          },
        }, `Adding ICE candidate failed for ${cameraId} due to ${error.message}`);
      }
    });
  }

  processIceQueue(peer, cameraId) {
    while (peer.iceQueue.length) {
      const candidate = peer.iceQueue.shift();
      this.addCandidateToPeer(peer, candidate, cameraId);
    }
  }

  isDisabled() {
    const disableCam = this.disableCam();
    const userLocked = this.userIsLocked();
    const isLocked = (disableCam && userLocked);

    const isConnecting = this.isWaitingResponse || (!this.hasVideoStream() && this.sharingWebcam());

    const viewParticipantsWebcams = Settings.dataSaving.viewParticipantsWebcams;

    return isLocked || isConnecting || !viewParticipantsWebcams;
  };
}

const videoService = new VideoService();

export default {
  exitVideo: () => videoService.exitVideo(),
  exitedVideo: () => videoService.exitedVideo(),
  disableCam: () => videoService.disableCam(),
  joinVideo: () => videoService.joinVideo(),
  joiningVideo: () => videoService.joiningVideo(),
  joinedVideo: () => videoService.joinedVideo(),
  sendUserShareWebcam: cameraId => videoService.sendUserShareWebcam(cameraId),
  sendUserUnshareWebcam: cameraId => videoService.sendUserUnshareWebcam(cameraId),
  getAllWebcamUsers: () => videoService.getAllWebcamUsers(),
  getInfo: () => videoService.getInfo(),
  userIsLocked: () => videoService.userIsLocked(),
  userGotLocked: () => videoService.userGotLocked(),
  getAuthenticatedURL: () => videoService.getAuthenticatedURL(),
  isLocalStream: cameraId => videoService.isLocalStream(cameraId),
  hasVideoStream: () => videoService.hasVideoStream(),
  sharingWebcam: () => videoService.sharingWebcam(),
  isDisabled: () => videoService.isDisabled(),
  playStart: cameraId => videoService.playStart(cameraId),
  getCameraProfile: () => videoService.getCameraProfile(),
  addCandidateToPeer: (peer, candidate, cameraId) => videoService.addCandidateToPeer(peer, candidate, cameraId),
  processIceQueue: (peer, cameraId) => videoService.processIceQueue(peer, cameraId),
  notify: message => notify(message, 'error', 'video'),
};



import { Tracker } from 'meteor/tracker';
import { Session } from 'meteor/session';
import Settings from '/imports/ui/services/settings';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import VideoStreams from '/imports/api/video-streams';
import UserListService from '/imports/ui/components/user-list/service';
import { makeCall } from '/imports/ui/services/api';
import { notify } from '/imports/ui/services/notification';
import logger from '/imports/startup/client/logger';

const CAMERA_PROFILES = Meteor.settings.public.kurento.cameraProfiles;

const SFU_URL = Meteor.settings.public.kurento.wsUrl;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const TOKEN = '_';

class VideoService {
  constructor() {
    this.defineProperties({
      isConnecting: false,
      isConnected: false,
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

  joinVideo(deviceId) {
    this.deviceId = deviceId;
    this.isConnecting = true;
  }

  joinedVideo() {
    this.isConnected = true;
  }

  exitVideo() {
    if (this.isConnected) {
      logger.info({
        logCode: 'video_provider_unsharewebcam',
      }, `Sending unshare all ${Auth.userID} webcams notification to meteor`);
      const streams = VideoStreams.find(
        {
          meetingId: Auth.meetingID,
          userId: Auth.userID,
        }, { fields: { stream: 1 } },
      ).fetch();

      streams.forEach(s => this.sendUserUnshareWebcam(s.stream));
      this.exitedVideo();
    }
  }

  exitedVideo() {
    this.isConnecting = false;
    this.deviceId = null;
    this.isConnected = false;
  }

  stopVideo(cameraId) {
    const streams = VideoStreams.find(
      {
        meetingId: Auth.meetingID,
        userId: Auth.userID,
      }, { fields: { stream: 1 } },
    ).fetch().length;
    this.sendUserUnshareWebcam(cameraId);
    if (streams < 2) {
      // If the user had less than 2 streams, set as a full disconnection
      this.exitedVideo();
    }
  }

  getSharedDevices() {
    const devices = VideoStreams.find(
      {
        meetingId: Auth.meetingID,
        userId: Auth.userID,
      }, { fields: { deviceId: 1 } },
    ).fetch().map(vs => vs.deviceId);

    return devices;
  }

  sendUserShareWebcam(cameraId) {
    makeCall('userShareWebcam', cameraId);
  }

  sendUserUnshareWebcam(cameraId) {
    makeCall('userUnshareWebcam', cameraId);
  }

  getAuthenticatedURL() {
    return Auth.authenticateURL(SFU_URL);
  }

  getVideoStreams() {
    const streams = VideoStreams.find(
      { meetingId: Auth.meetingID },
      {
        fields: {
          userId: 1, stream: 1, name: 1,
        },
      },
    ).fetch();

    const connectingStream = this.getConnectingStream(streams);

    if (connectingStream) streams.push(connectingStream);

    return streams.map(vs => ({
      cameraId: vs.stream,
      userId: vs.userId,
      name: vs.name,
    })).sort(UserListService.sortUsersByName);
  }

  getConnectingStream(streams) {
    let connectingStream;

    if (this.isConnecting) {
      if (this.deviceId) {
        const stream = this.buildStreamName(Auth.userID, this.deviceId);
        if (!this.hasStream(streams, stream) && !this.isUserLocked()) {
          connectingStream = {
            stream,
            userId: Auth.userID,
            name: Auth.fullname,
          };
        } else {
          // Connecting stream is already stored at database
          this.deviceId = null;
          this.isConnecting = false;
        }
      } else {
        logger.error({
          logCode: 'video_provider_missing_deviceid',
        }, 'Could not retrieve a valid deviceId');
      }
    }

    return connectingStream;
  }

  buildStreamName(userId, deviceId) {
    return `${userId}${TOKEN}${deviceId}`;
  }

  hasVideoStream() {
    const videoStreams = VideoStreams.findOne({ userId: Auth.userID },
      { fields: {} });
    return !!videoStreams;
  }

  hasStream(streams, stream) {
    return streams.find(s => s.stream === stream);
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
    };
  }

  isUserLocked() {
    return !!Users.findOne({
      userId: Auth.userID,
      locked: true,
      role: { $ne: ROLE_MODERATOR },
    }, { fields: {} }) && this.disableCam();
  }

  lockUser() {
    if (this.isConnected) {
      this.exitVideo();
    }
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
    const deviceId = Session.get('WebcamDeviceId');
    if (deviceId) {
      cameraProfile.constraints = cameraProfile.constraints || {};
      cameraProfile.constraints.deviceId = { exact: deviceId };
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

  processInboundIceQueue(peer, cameraId) {
    while (peer.inboundIceQueue.length) {
      const candidate = peer.inboundIceQueue.shift();
      this.addCandidateToPeer(peer, candidate, cameraId);
    }
  }

  onBeforeUnload() {
    this.exitVideo();
  }

  isDisabled() {
    const { viewParticipantsWebcams } = Settings.dataSaving;

    return this.isUserLocked() || this.isConnecting || !viewParticipantsWebcams;
  }

  getRole(isLocal) {
    return isLocal ? 'share' : 'viewer';
  }
}

const videoService = new VideoService();

export default {
  exitVideo: () => videoService.exitVideo(),
  joinVideo: deviceId => videoService.joinVideo(deviceId),
  stopVideo: cameraId => videoService.stopVideo(cameraId),
  getVideoStreams: () => videoService.getVideoStreams(),
  getInfo: () => videoService.getInfo(),
  isUserLocked: () => videoService.isUserLocked(),
  lockUser: () => videoService.lockUser(),
  getAuthenticatedURL: () => videoService.getAuthenticatedURL(),
  isLocalStream: cameraId => videoService.isLocalStream(cameraId),
  hasVideoStream: () => videoService.hasVideoStream(),
  isDisabled: () => videoService.isDisabled(),
  playStart: cameraId => videoService.playStart(cameraId),
  getCameraProfile: () => videoService.getCameraProfile(),
  addCandidateToPeer: (peer, candidate, cameraId) => videoService.addCandidateToPeer(peer, candidate, cameraId),
  processInboundIceQueue: (peer, cameraId) => videoService.processInboundIceQueue(peer, cameraId),
  getRole: isLocal => videoService.getRole(isLocal),
  getSharedDevices: () => videoService.getSharedDevices(),
  onBeforeUnload: () => videoService.onBeforeUnload(),
  notify: message => notify(message, 'error', 'video'),
};

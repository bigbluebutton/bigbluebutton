import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import Auth from '/imports/ui/services/auth';
import { notify } from '/imports/ui/services/notification';
import deviceInfo from '/imports/utils/deviceInfo';
import browserInfo from '/imports/utils/browserInfo';
import getFromUserSettings from '/imports/ui/services/users-settings';
import VideoPreviewService from '/imports/ui/components/video-preview/service';
import Storage from '/imports/ui/services/storage/session';
import { getStorageSingletonInstance } from '/imports/ui/services/storage';
import logger from '/imports/startup/client/logger';
import {
  setVideoState,
  setConnectingStream,
  getVideoState,
} from './state';
import WebRtcPeer from '/imports/ui/services/webrtc-base/peer';
import { Constraints2 } from '/imports/ui/Types/meetingClientSettings';
import MediaStreamUtils from '/imports/utils/media-stream-utils';
import Session from '/imports/ui/services/storage/in-memory';
import type { Stream, StreamItem, VideoItem } from './types';
import { VIDEO_TYPES } from './enums';
import BBBVideoStream from '/imports/ui/services/webrtc-base/bbb-video-stream';
import {
  getLKStats,
  lkToggleMuteCameras,
} from '/imports/ui/services/livekit';

const TOKEN = '_';

const FILTER_VIDEO_STATS = [
  'outbound-rtp',
  'inbound-rtp',
];

class VideoService {
  public isMobile: boolean;

  public webRtcPeersRef: Record<string, WebRtcPeer>;

  private userParameterProfile: string | null;

  private isSafari: boolean;

  private numberOfDevices: number;

  private record: boolean | null;

  private deviceId: string | null = null;

  private activePeers: Record<string, RTCPeerConnection>;

  private clientSessionUUID: string;

  constructor() {
    this.userParameterProfile = null;
    this.isMobile = deviceInfo.isMobile;
    this.isSafari = browserInfo.isSafari;
    this.numberOfDevices = 0;
    this.record = null;
    this.clientSessionUUID = '0';

    if (navigator.mediaDevices) {
      this.updateNumberOfDevices = this.updateNumberOfDevices.bind(this);
      if (!this.isSafari) {
        navigator.mediaDevices.ondevicechange = () => this.updateNumberOfDevices();
      }
      this.updateNumberOfDevices();
    }

    this.webRtcPeersRef = {};
    this.activePeers = {};
  }

  static fetchNumberOfDevices(devices: MediaDeviceInfo[]) {
    const deviceIds: string[] = [];
    devices.forEach((d) => {
      const validDeviceId = d.deviceId !== '' && !deviceIds.includes(d.deviceId);
      if (d.kind === 'videoinput' && validDeviceId) {
        deviceIds.push(d.deviceId);
      }
    });

    return deviceIds.length;
  }

  updateNumberOfDevices(devices: MediaDeviceInfo[] | null = null) {
    if (devices) {
      this.numberOfDevices = VideoService.fetchNumberOfDevices(devices);
    } else {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        this.numberOfDevices = VideoService.fetchNumberOfDevices(devices);
      });
    }
  }

  joinVideo(deviceId: string, isUserLocked: boolean) {
    this.deviceId = deviceId;
    Storage.setItem('isFirstJoin', false);
    if (!isUserLocked) {
      const streamName = this.buildStreamName(deviceId);
      const stream = {
        stream: streamName,
        userId: Auth.userID as string,
        name: Auth.fullname as string,
        nameSortable: Auth.fullname as string,
        type: VIDEO_TYPES.CONNECTING,
      };
      setConnectingStream(stream);
      setVideoState({ isConnecting: true });
    }
  }

  static joinedVideo() {
    setVideoState({
      isConnected: true,
      isConnecting: false,
    });
  }

  storeDeviceIds(streams: Stream[]) {
    const deviceIds: string[] = [];
    streams
      .filter((s) => this.isLocalStream(s.stream))
      .forEach((s) => {
        deviceIds.push(s.deviceId);
      });
    Session.setItem('deviceIds', deviceIds.join());
  }

  exitedVideo() {
    this.stopConnectingStream();
    setVideoState({
      isConnected: false,
      isConnecting: false,
    });
  }

  static getAuthenticatedURL() {
    const SFU_URL = window.meetingClientSettings.public.kurento.wsUrl;
    return Auth.authenticateURL(SFU_URL);
  }

  static getCameraProfiles() {
    return window.meetingClientSettings.public.kurento.cameraProfiles;
  }

  static isPaginationEnabled() {
    const Settings = getSettingsSingletonInstance();
    return Settings.application.paginationEnabled;
  }

  static setCurrentVideoPageIndex(newVideoPageIndex: number) {
    const { currentVideoPageIndex } = getVideoState();
    if (currentVideoPageIndex !== newVideoPageIndex) {
      setVideoState({ currentVideoPageIndex: newVideoPageIndex });
    }
  }

  static getCurrentVideoPageIndex() {
    const { currentVideoPageIndex } = getVideoState();
    return currentVideoPageIndex;
  }

  static calculateNextPage() {
    const { numberOfPages, currentVideoPageIndex } = getVideoState();
    if (numberOfPages === 0) {
      return 0;
    }

    return (((currentVideoPageIndex + 1) % numberOfPages) + numberOfPages) % numberOfPages;
  }

  static calculatePreviousPage() {
    const { numberOfPages, currentVideoPageIndex } = getVideoState();
    if (numberOfPages === 0) {
      return 0;
    }

    return (((currentVideoPageIndex - 1) % numberOfPages) + numberOfPages) % numberOfPages;
  }

  static getNextVideoPage() {
    const nextPage = VideoService.calculateNextPage();
    VideoService.setCurrentVideoPageIndex(nextPage);
  }

  static getPreviousVideoPage() {
    const previousPage = VideoService.calculatePreviousPage();
    VideoService.setCurrentVideoPageIndex(previousPage);
  }

  static isGridEnabled() {
    return Session.getItem('isGridEnabled');
  }

  stopConnectingStream() {
    this.deviceId = null;
    setConnectingStream(null);
  }

  buildStreamName(deviceId: string) {
    return `${this.getPrefix()}${TOKEN}${deviceId}`;
  }

  static getMediaServerAdapter() {
    const { videoMediaServer } = window.meetingClientSettings.public.kurento;
    return videoMediaServer;
  }

  static getRoleModerator() {
    return window.meetingClientSettings.public.user.role_moderator;
  }

  static getRoleViewer() {
    return window.meetingClientSettings.public.user.role_viewer;
  }

  static getPageChangeDebounceTime() {
    const {
      pageChangeDebounceTime: PAGE_CHANGE_DEBOUNCE_TIME,
    } = window.meetingClientSettings.public.kurento.pagination;

    return PAGE_CHANGE_DEBOUNCE_TIME;
  }

  getRecord() {
    if (this.record === null) {
      this.record = getFromUserSettings('bbb_record_video', true);
    }

    return this.record;
  }

  static mirrorOwnWebcam(userId: string | null = null) {
    const MIRROR_WEBCAM = window.meetingClientSettings.public.app.mirrorOwnWebcam;
    const isOwnWebcam = userId ? Auth.userID === userId : true;
    const isEnabledMirroring = getFromUserSettings('bbb_mirror_own_webcam', MIRROR_WEBCAM);
    return isOwnWebcam && isEnabledMirroring;
  }

  static isPinEnabled() {
    return window.meetingClientSettings.public.kurento.enableVideoPin;
  }

  getMyStreamId(deviceId: string, streams: Stream[]) {
    const videoStream = streams.find(
      (vs) => this.isLocalStream(vs.stream)
        && vs.deviceId === deviceId,
    );
    return videoStream ? videoStream.stream : null;
  }

  isLocalStream(cameraId: unknown) {
    return typeof cameraId === 'string' && cameraId.startsWith(this.getPrefix());
  }

  static getCameraProfile() {
    const CAMERA_PROFILES = VideoService.getCameraProfiles();
    const BBBStorage = getStorageSingletonInstance();
    const profileId = BBBStorage.getItem('WebcamProfileId') || '';
    const cameraProfile = CAMERA_PROFILES.find((profile) => profile.id === profileId)
      || CAMERA_PROFILES.find((profile) => profile.default)
      || CAMERA_PROFILES[0];
    const deviceId = BBBStorage.getItem('WebcamDeviceId');
    if (deviceId) {
      // @ts-expect-error -> Untyped object.
      cameraProfile.constraints = cameraProfile.constraints || {};
      // @ts-expect-error -> Untyped object.
      cameraProfile.constraints.deviceId = { exact: deviceId };
    }

    return cameraProfile;
  }

  static addCandidateToPeer(peer: WebRtcPeer, candidate: Record<string | symbol, unknown>, cameraId: string) {
    peer.addIceCandidate(candidate).catch((error: Error) => {
      if (error) {
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

  static processInboundIceQueue(peer: WebRtcPeer, cameraId: string) {
    // @ts-expect-error -> Untyped object.
    while (peer.inboundIceQueue.length) {
      // @ts-expect-error -> Untyped object.
      const candidate = peer.inboundIceQueue.shift();
      VideoService.addCandidateToPeer(peer, candidate, cameraId);
    }
  }

  static getRole(isLocal: boolean) {
    return isLocal ? 'share' : 'viewer';
  }

  getUserParameterProfile() {
    const CAMERA_PROFILES = VideoService.getCameraProfiles();
    if (this.userParameterProfile === null) {
      this.userParameterProfile = getFromUserSettings(
        'bbb_preferred_camera_profile',
        (CAMERA_PROFILES.find((i) => i.default) || {}).id || null,
      );
    }

    return this.userParameterProfile;
  }

  isMultipleCamerasEnabled() {
    const MULTIPLE_CAMERAS = window.meetingClientSettings.public.app.enableMultipleCameras;
    return MULTIPLE_CAMERAS
      && !VideoPreviewService.getSkipVideoPreview()
      && !this.isMobile
      && !this.isSafari
      && this.numberOfDevices > 1;
  }

  static isProfileBetter(newProfileId: string, originalProfileId: string) {
    const CAMERA_PROFILES = VideoService.getCameraProfiles();
    return CAMERA_PROFILES.findIndex(({ id }) => id === newProfileId)
      > CAMERA_PROFILES.findIndex(({ id }) => id === originalProfileId);
  }

  static applyBitrate(peer: WebRtcPeer, bitrate: number) {
    const { peerConnection } = peer;
    if ('RTCRtpSender' in window
      && 'setParameters' in window.RTCRtpSender.prototype
      && 'getParameters' in window.RTCRtpSender.prototype) {
      peerConnection.getSenders().forEach((sender: RTCRtpSender) => {
        const { track } = sender;
        if (track && track.kind === 'video') {
          const parameters = sender.getParameters();
          const normalizedBitrate = bitrate * 1000;

          if (parameters.encodings == null || parameters.encodings.length === 0) {
            parameters.encodings = [{}];
          }

          if (parameters.encodings[0].maxBitrate !== normalizedBitrate) {
            parameters.encodings[0].maxBitrate = normalizedBitrate;
            sender.setParameters(parameters)
              .then(() => {
                logger.info({
                  logCode: 'video_provider_bitratechange',
                  extraInfo: { bitrate },
                }, `Bitrate changed: ${bitrate}`);
              })
              .catch((error) => {
                logger.warn({
                  logCode: 'video_provider_bitratechange_failed',
                  extraInfo: { bitrate, errorMessage: error.message, errorCode: error.code },
                }, 'Bitrate change failed.');
              });
          }
        }
      });
    }
  }

  static reapplyResolutionIfNeeded(track: MediaStreamTrack, constraints?: Constraints2) {
    if (typeof track.getSettings !== 'function') {
      return constraints;
    }

    const trackSettings = track.getSettings();

    if (trackSettings.width && trackSettings.height) {
      return {
        ...constraints,
        width: trackSettings.width,
        height: trackSettings.height,
      };
    }

    return constraints;
  }

  static applyCameraProfile(peer: WebRtcPeer, profileId: string) {
    const CAMERA_PROFILES = VideoService.getCameraProfiles();
    const profile = CAMERA_PROFILES.find((targetProfile) => targetProfile.id === profileId);
    const {
      applyConstraints: CAMERA_QUALITY_THR_CONSTRAINTS = false,
    } = window.meetingClientSettings.public.kurento.cameraQualityThresholds;

    if (!profile
      || peer == null
      || peer.peerConnection == null
      // @ts-expect-error -> Untyped object.
      || peer.currentProfileId === profileId
      // @ts-expect-error -> Untyped object.
      || VideoService.isProfileBetter(profileId, peer.originalProfileId)) {
      return;
    }

    const { bitrate, constraints } = profile;

    if (bitrate) VideoService.applyBitrate(peer, bitrate);

    if (CAMERA_QUALITY_THR_CONSTRAINTS
      && constraints
      && typeof constraints === 'object'
    ) {
      peer.peerConnection.getSenders().forEach((sender: RTCRtpSender) => {
        const { track } = sender;
        if (track && track.kind === 'video' && typeof track.applyConstraints === 'function') {
          const normalizedVideoConstraints = VideoService.reapplyResolutionIfNeeded(track, constraints);
          track.applyConstraints(normalizedVideoConstraints)
            .catch((error) => {
              logger.warn({
                logCode: 'video_provider_constraintchange_failed',
                extraInfo: { errorName: error.name, errorCode: error.code },
              }, 'Error applying camera profile');
            });
        }
      });
    }

    logger.info({
      logCode: 'video_provider_profile_applied',
      extraInfo: { profileId },
    }, `New camera profile applied: ${profileId}`);

    // @ts-expect-error -> Untyped object.
    // eslint-disable-next-line no-param-reassign
    peer.currentProfileId = profileId;
  }

  static getStreamsToConnectAndDisconnect(allStreams: VideoItem[], connectedStreamIds: string[]) {
    const cameraIds = allStreams
      .filter((s) => s?.type !== VIDEO_TYPES.GRID)
      .map((s) => (s as StreamItem).stream);
    const streamsToConnect = cameraIds.filter((stream) => {
      return !connectedStreamIds.includes(stream);
    });

    const streamsToDisconnect = connectedStreamIds.filter((stream) => {
      return !cameraIds.includes(stream);
    });

    return [streamsToConnect, streamsToDisconnect];
  }

  static getThreshold(numberOfPublishers: number) {
    const {
      thresholds: CAMERA_QUALITY_THRESHOLDS = [],
    } = window.meetingClientSettings.public.kurento.cameraQualityThresholds;

    let targetThreshold = { threshold: 0, profile: 'original' };
    let finalThreshold = { threshold: 0, profile: 'original' };

    for (let mapIndex = 0; mapIndex < CAMERA_QUALITY_THRESHOLDS.length; mapIndex += 1) {
      targetThreshold = CAMERA_QUALITY_THRESHOLDS[mapIndex];
      if (targetThreshold.threshold <= numberOfPublishers) {
        finalThreshold = targetThreshold;
      }
    }

    return finalThreshold;
  }

  getPreloadedStream() {
    if (this.deviceId == null) return null;
    return VideoPreviewService.getStream(this.deviceId);
  }

  updatePeerDictionaryReference(newRef: Record<string, WebRtcPeer>) {
    this.webRtcPeersRef = newRef;
  }

  setTrackEnabled(value: boolean) {
    const localPeers = Object.values(this.webRtcPeersRef).filter(
      // @ts-expect-error -> Until all codebase is in Typescript.
      (peer) => peer.isPublisher,
    );
    localPeers.forEach((peer) => {
      const stream = peer.getLocalStream();
      MediaStreamUtils.getVideoTracks(stream).forEach((track: MediaStreamTrack) => {
        // eslint-disable-next-line no-param-reassign
        track.enabled = value;
      });
    });

    // LiveKit compatibility
    lkToggleMuteCameras(!value);
  }

  getClientSessionUUID() {
    if (this.clientSessionUUID === '0') {
      this.clientSessionUUID = sessionStorage.getItem('clientSessionUUID') || '0';
    }

    return this.clientSessionUUID;
  }

  getPrefix() {
    return `${Auth.userID}${TOKEN}${this.getClientSessionUUID()}`;
  }

  updateActivePeers(streams: StreamItem[]) {
    const activePeers: Record<string, RTCPeerConnection> = {};

    streams.forEach((vs) => {
      if (this.webRtcPeersRef[vs.stream]) {
        activePeers[vs.stream] = this.webRtcPeersRef[vs.stream].peerConnection;
      }
    });

    this.activePeers = activePeers;
  }

  async getStats() {
    const stats: Record<string, unknown> = {};

    await Promise.all(
      Object.keys(this.activePeers).map(async (peerId) => {
        const peerStats = await this.activePeers[peerId].getStats();

        const videoStats: Record<string, unknown> = {};

        peerStats.forEach((stat) => {
          if (FILTER_VIDEO_STATS.includes(stat.type)) {
            videoStats[stat.type] = stat;
          }
        });
        stats[peerId] = videoStats;
      }),
    );

    try {
      const lkStats = await getLKStats();
      lkStats.forEach((stat) => {
        // @ts-expect-error -> Untyped object.
        const { id, type: statType, kind } = stat;

        if (FILTER_VIDEO_STATS.includes(statType) && (!kind || kind === 'video')) {
          stats[id] = { [statType]: stat };
        }
      });
    } catch (error) {
      logger.error({
        logCode: 'video_provider_livekit_stats_error',
        extraInfo: {
          errorName: (error as Error).name,
          errorMessage: (error as Error).message,
          errorStack: (error as Error).stack,
        },
      }, `Failed to get LiveKit video stats: ${(error as Error).message}`);
    }

    return stats;
  }

  static async startVirtualBackground(
    bbbVideoStream: BBBVideoStream,
    backgroundType: string,
    name: string,
    data: string,
  ) {
    try {
      if (bbbVideoStream && name && data) {
        await bbbVideoStream.startVirtualBackground(backgroundType, name, { file: data });
      } else {
        throw new Error('startVirtualBackground: Invalid parameters');
      }
    } catch (error) {
      logger.error({
        logCode: 'video_provider_virtualbg_error',
        extraInfo: {
          errorName: (error as Error).name,
          errorMessage: (error as Error).message,
          errorStack: (error as Error).stack,
          virtualBgType: backgroundType,
          virtualBgName: name,
        },
      }, 'Failed to start virtual background by dropping image');

      throw error;
    }
  }
}

const videoService = new VideoService();

export default {
  addCandidateToPeer: VideoService.addCandidateToPeer,
  getMyStreamId: videoService.getMyStreamId.bind(videoService),
  getAuthenticatedURL: VideoService.getAuthenticatedURL,
  getRole: VideoService.getRole,
  getMediaServerAdapter: VideoService.getMediaServerAdapter,
  getCameraProfile: VideoService.getCameraProfile,
  getThreshold: VideoService.getThreshold,
  getStreamsToConnectAndDisconnect: VideoService.getStreamsToConnectAndDisconnect,
  getPreviousVideoPage: VideoService.getPreviousVideoPage,
  getNextVideoPage: VideoService.getNextVideoPage,
  getCurrentVideoPageIndex: VideoService.getCurrentVideoPageIndex,
  isLocalStream: videoService.isLocalStream.bind(videoService),
  isPaginationEnabled: VideoService.isPaginationEnabled,
  mirrorOwnWebcam: VideoService.mirrorOwnWebcam,
  processInboundIceQueue: VideoService.processInboundIceQueue,
  storeDeviceIds: videoService.storeDeviceIds.bind(videoService),
  joinedVideo: () => VideoService.joinedVideo(),
  exitedVideo: () => videoService.exitedVideo(),
  getPreloadedStream: () => videoService.getPreloadedStream(),
  getRecord: () => videoService.getRecord(),
  getPageChangeDebounceTime: () => VideoService.getPageChangeDebounceTime(),
  getUserParameterProfile: () => videoService.getUserParameterProfile(),
  isMultipleCamerasEnabled: () => videoService.isMultipleCamerasEnabled(),
  joinVideo: (deviceId: string, isUserLocked: boolean) => videoService.joinVideo(deviceId, isUserLocked),
  updateNumberOfDevices: (devices: MediaDeviceInfo[]) => videoService.updateNumberOfDevices(devices),
  stopConnectingStream: videoService.stopConnectingStream,
  updatePeerDictionaryReference: (
    newRef: Record<string, WebRtcPeer>,
  ) => videoService.updatePeerDictionaryReference(newRef),
  getWebRtcPeersRef: () => videoService.webRtcPeersRef,
  isMobile: videoService.isMobile,
  notify: (message: string) => notify(message, 'error', 'video'),
  applyCameraProfile: VideoService.applyCameraProfile,
  setTrackEnabled: (value: boolean) => videoService.setTrackEnabled(value),
  getRoleModerator: VideoService.getRoleModerator,
  getRoleViewer: VideoService.getRoleViewer,
  getPrefix: videoService.getPrefix.bind(videoService),
  isPinEnabled: VideoService.isPinEnabled,
  updateActivePeers: (streams: StreamItem[]) => videoService.updateActivePeers(streams),
  getStats: () => videoService.getStats(),
  buildStreamName: (deviceId: string) => videoService.buildStreamName(deviceId),
  startVirtualBackground: VideoService.startVirtualBackground,
};

import { Tracker } from 'meteor/tracker';
import { Session } from 'meteor/session';
import Settings from '/imports/ui/services/settings';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import VideoStreams from '/imports/api/video-streams';
import UserListService from '/imports/ui/components/user-list/service';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { notify } from '/imports/ui/services/notification';
import deviceInfo from '/imports/utils/deviceInfo';
import browserInfo from '/imports/utils/browserInfo';
import getFromUserSettings from '/imports/ui/services/users-settings';
import VideoPreviewService from '../video-preview/service';
import Storage from '/imports/ui/services/storage/session';
import BBBStorage from '/imports/ui/services/storage';
import logger from '/imports/startup/client/logger';
import { debounce } from '/imports/utils/debounce';
import { partition } from '/imports/utils/array-utils';
import {
  getSortingMethod,
  sortVideoStreams,
} from '/imports/ui/components/video-provider/stream-sorting';
import getFromMeetingSettings from '/imports/ui/services/meeting-settings';

const CAMERA_PROFILES = window.meetingClientSettings.public.kurento.cameraProfiles;
const MULTIPLE_CAMERAS = window.meetingClientSettings.public.app.enableMultipleCameras;

const SFU_URL = window.meetingClientSettings.public.kurento.wsUrl;
const ROLE_MODERATOR = window.meetingClientSettings.public.user.role_moderator;
const ROLE_VIEWER = window.meetingClientSettings.public.user.role_viewer;
const MIRROR_WEBCAM = window.meetingClientSettings.public.app.mirrorOwnWebcam;
const PIN_WEBCAM = window.meetingClientSettings.public.kurento.enableVideoPin;
const {
  thresholds: CAMERA_QUALITY_THRESHOLDS = [],
  applyConstraints: CAMERA_QUALITY_THR_CONSTRAINTS = false,
  debounceTime: CAMERA_QUALITY_THR_DEBOUNCE = 2500,
} = window.meetingClientSettings.public.kurento.cameraQualityThresholds;
const {
  paginationToggleEnabled: PAGINATION_TOGGLE_ENABLED,
  pageChangeDebounceTime: PAGE_CHANGE_DEBOUNCE_TIME,
  desktopPageSizes: DESKTOP_PAGE_SIZES,
  mobilePageSizes: MOBILE_PAGE_SIZES,
  desktopGridSizes: DESKTOP_GRID_SIZES,
  mobileGridSizes: MOBILE_GRID_SIZES,
} = window.meetingClientSettings.public.kurento.pagination;
const PAGINATION_THRESHOLDS_CONF = window.meetingClientSettings.public.kurento.paginationThresholds;
const PAGINATION_THRESHOLDS = PAGINATION_THRESHOLDS_CONF.thresholds.sort((t1, t2) => t1.users - t2.users);
const PAGINATION_THRESHOLDS_ENABLED = PAGINATION_THRESHOLDS_CONF.enabled;
const {
  paginationSorting: PAGINATION_SORTING,
  defaultSorting: DEFAULT_SORTING,
} = window.meetingClientSettings.public.kurento.cameraSortingModes;
const DEFAULT_VIDEO_MEDIA_SERVER = window.meetingClientSettings.public.kurento.videoMediaServer;

const FILTER_VIDEO_STATS = [
  'outbound-rtp',
  'inbound-rtp',
];

const TOKEN = '_';

class VideoService {
  constructor() {
    this.defineProperties({
      isConnecting: false,
      isConnected: false,
      currentVideoPageIndex: 0,
      numberOfPages: 0,
      pageSize: 0,
    });
    this.userParameterProfile = null;

    this.isMobile = deviceInfo.isMobile;
    this.isSafari = browserInfo.isSafari;
    this.numberOfDevices = 0;

    this.record = null;
    this.hackRecordViewer = null;

    // If the page isn't served over HTTPS there won't be mediaDevices
    if (navigator.mediaDevices) {
      this.updateNumberOfDevices = this.updateNumberOfDevices.bind(this);
      // Safari doesn't support ondevicechange
      if (!this.isSafari) {
        navigator.mediaDevices.ondevicechange = event => this.updateNumberOfDevices();
      }
      this.updateNumberOfDevices();
    }

    // FIXME this is abhorrent. Remove when peer lifecycle is properly decoupled
    // from the React component's lifecycle. Any attempt at a half-baked
    // decoupling will most probably generate problems - prlanzarin Dec 16 2021
    this.webRtcPeersRef = {};
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

  fetchNumberOfDevices(devices) {
    const deviceIds = [];
    devices.forEach(d => {
      const validDeviceId = d.deviceId !== '' && !deviceIds.includes(d.deviceId)
      if (d.kind === 'videoinput' && validDeviceId) {
        deviceIds.push(d.deviceId);
      }
    });

    return deviceIds.length;
  }

  updateNumberOfDevices(devices = null) {
    if (devices) {
      this.numberOfDevices = this.fetchNumberOfDevices(devices);
    } else {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        this.numberOfDevices = this.fetchNumberOfDevices(devices);
      });
    }
  }

  joinVideo(deviceId) {
    this.deviceId = deviceId;
    this.isConnecting = true;
    Storage.setItem('isFirstJoin', false);
  }

  joinedVideo() {
    this.isConnected = true;
  }

  storeDeviceIds() {
    const streams = VideoStreams.find(
      {
        meetingId: Auth.meetingID,
        userId: Auth.userID,
      }, { fields: { deviceId: 1 } },
    ).fetch();

    let deviceIds = [];
    streams.forEach(s => {
      deviceIds.push(s.deviceId);
    }
    );
    Session.set('deviceIds', deviceIds.join());
  }

  exitVideo(sendUserUnshareWebcam) {
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

      streams.forEach(s => sendUserUnshareWebcam(s.stream));
      this.exitedVideo();
    }
  }

  exitedVideo() {
    this.isConnecting = false;
    this.deviceId = null;
    this.isConnected = false;
  }

  stopVideo(cameraId, sendUserUnshareWebcam) {
    const streams = VideoStreams.find(
      {
        meetingId: Auth.meetingID,
        userId: Auth.userID,
      }, { fields: { stream: 1 } },
    ).fetch();

    const hasTargetStream = streams.some(s => s.stream === cameraId);
    const hasOtherStream = streams.some(s => s.stream !== cameraId);

    // Check if the target (cameraId) stream exists in the remote collection.
    // If it does, means it was successfully shared. So do the full stop procedure.
    if (hasTargetStream) {
      sendUserUnshareWebcam(cameraId);
    }

    if (!hasOtherStream) {
      // There's no other remote stream, meaning (OR)
      // a) This was effectively the last webcam being unshared
      // b) This was a connecting stream timing out (not effectively shared)
      // For both cases, we clean everything up.
      this.exitedVideo();
    } else {
      // It was not the last webcam the user had successfully shared,
      // nor was cameraId present in the server collection.
      // Hence it's a connecting stream (not effectively shared) which timed out
      this.stopConnectingStream();
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

  getAuthenticatedURL() {
    return Auth.authenticateURL(SFU_URL);
  }

  shouldRenderPaginationToggle() {
    // Only enable toggle if configured to do so and if we have a page size properly setup
    return PAGINATION_TOGGLE_ENABLED && (this.getMyPageSize() > 0);
  }

  isPaginationEnabled () {
    return Settings.application.paginationEnabled && (this.getMyPageSize() > 0);
  }

  setNumberOfPages (numberOfPublishers, numberOfSubscribers, pageSize) {
    // Page size 0 means no pagination, return itself
    if (pageSize === 0) return 0;

    // Page size refers only to the number of subscribers. Publishers are always
    // shown, hence not accounted for
    const nofPages = Math.ceil(numberOfSubscribers / pageSize);

    if (nofPages !== this.numberOfPages) {
      this.numberOfPages = nofPages;
      // Check if we have to page back on the current video page index due to a
      // page ceasing to exist
      if (nofPages === 0) {
        this.currentVideoPageIndex = 0;
      } else if ((this.currentVideoPageIndex + 1) > this.numberOfPages) {
        this.getPreviousVideoPage();
      }
    }

    return this.numberOfPages;
  }

  getNumberOfPages () {
    return this.numberOfPages;
  }

  setCurrentVideoPageIndex (newVideoPageIndex) {
    if (this.currentVideoPageIndex !== newVideoPageIndex) {
      this.currentVideoPageIndex = newVideoPageIndex;
    }
  }

  getCurrentVideoPageIndex () {
    return this.currentVideoPageIndex;
  }

  calculateNextPage () {
    if (this.numberOfPages === 0) {
      return 0;
    }

    return ((this.currentVideoPageIndex + 1) % this.numberOfPages + this.numberOfPages) % this.numberOfPages;
  }

  calculatePreviousPage () {
    if (this.numberOfPages === 0) {
      return 0;
    }

    return ((this.currentVideoPageIndex - 1) % this.numberOfPages + this.numberOfPages) % this.numberOfPages;
  }

  getNextVideoPage() {
    const nextPage = this.calculateNextPage();
    this.setCurrentVideoPageIndex(nextPage);

    return this.currentVideoPageIndex;
  }

  getPreviousVideoPage() {
    const previousPage = this.calculatePreviousPage();
    this.setCurrentVideoPageIndex(previousPage);

    return this.currentVideoPageIndex;
  }

  getPageSizeDictionary () {
    // Dynamic page sizes are disabled. Fetch the stock page sizes.
    if (!PAGINATION_THRESHOLDS_ENABLED || PAGINATION_THRESHOLDS.length <= 0) {
      return !this.isMobile ? DESKTOP_PAGE_SIZES : MOBILE_PAGE_SIZES;
    }

    // Dynamic page sizes are enabled. Get the user count, isolate the
    // matching threshold entry, return the val.
    let targetThreshold;
    const userCount = UserListService.getUserCount();
    const processThreshold = (threshold = {
      desktopPageSizes: DESKTOP_PAGE_SIZES,
      mobilePageSizes: MOBILE_PAGE_SIZES
    }) => {
      // We don't demand that all page sizes should be set in pagination profiles.
      // That saves us some space because don't necessarily need to scale mobile
      // endpoints.
      // If eg mobile isn't set, then return the default value.
      if (!this.isMobile) {
        return threshold.desktopPageSizes || DESKTOP_PAGE_SIZES;
      } else {
        return threshold.mobilePageSizes || MOBILE_PAGE_SIZES;
      }
    };

    // Short-circuit: no threshold yet, return stock values (processThreshold has a default arg)
    if (userCount < PAGINATION_THRESHOLDS[0].users) return processThreshold();

    // Reverse search for the threshold where our participant count is directly equal or great
    // The PAGINATION_THRESHOLDS config is sorted when imported.
    for (let mapIndex = PAGINATION_THRESHOLDS.length - 1; mapIndex >= 0; --mapIndex) {
      targetThreshold = PAGINATION_THRESHOLDS[mapIndex];
      if (targetThreshold.users <= userCount) {
        return processThreshold(targetThreshold);
      }
    }
  }

  setPageSize (size) {
    if (this.pageSize !== size) {
      this.pageSize = size;
    }

    return this.pageSize;
  }

  getMyPageSize () {
    let size;
    const myRole = this.getMyRole();
    const pageSizes = this.getPageSizeDictionary();
    switch (myRole) {
      case ROLE_MODERATOR:
        size = pageSizes.moderator;
        break;
      case ROLE_VIEWER:
      default:
        size = pageSizes.viewer
    }

    return this.setPageSize(size);
  }

  getGridSize () {
    let size;
    const myRole = this.getMyRole();
    const gridSizes = !this.isMobile ? DESKTOP_GRID_SIZES : MOBILE_GRID_SIZES;
    
    switch (myRole) {
      case ROLE_MODERATOR:
        size = gridSizes.moderator;
        break;
      case ROLE_VIEWER:
      default:
        size = gridSizes.viewer
    }

    return size;
  }

  getVideoPage (streams, pageSize) {
    // Publishers are taken into account for the page size calculations. They
    // also appear on every page. Same for pinned user.
    const [filtered, others] = partition(streams, (vs) => Auth.userID === vs.userId || vs.pin);

    // Separate pin from local cameras
    const [pin, mine] = partition(filtered, (vs) => vs.pin);

    // Recalculate total number of pages
    this.setNumberOfPages(filtered.length, others.length, pageSize);
    const chunkIndex = this.currentVideoPageIndex * pageSize;

    // This is an extra check because pagination is globally in effect (hard
    // limited page sizes, toggles on), but we might still only have one page.
    // Use the default sorting method if that's the case.
    const sortingMethod = (this.numberOfPages > 1) ? PAGINATION_SORTING : DEFAULT_SORTING;
    const paginatedStreams = sortVideoStreams(others, sortingMethod)
      .slice(chunkIndex, (chunkIndex + pageSize)) || [];

    if (getSortingMethod(sortingMethod).localFirst) {
      return [...pin, ...mine, ...paginatedStreams];
    }
    return [...pin, ...paginatedStreams, ...mine];
  }

  getUsersIdFromVideoStreams() {
    const usersId = VideoStreams.find(
      { meetingId: Auth.meetingID },
      { fields: { userId: 1 } },
    ).fetch().map(user => user.userId);

    return usersId;
  }

  getVideoPinByUser(userId) {
    const user = Users.findOne({ userId }, { fields: { pin: 1 } });

    return user?.pin || false;
  }

  isGridEnabled() {
    return Session.get('isGridEnabled');
  }

  getVideoStreams() {
    const pageSize = this.getMyPageSize();
    const isPaginationDisabled = !this.isPaginationEnabled() || pageSize === 0;
    const { neededDataTypes } = isPaginationDisabled
      ? getSortingMethod(DEFAULT_SORTING)
      : getSortingMethod(PAGINATION_SORTING);
    const isGridEnabled = this.isGridEnabled();
    let gridUsers = [];
    let users = [];

    if (isGridEnabled) {
      users = Users.find(
        { meetingId: Auth.meetingID },
        { fields: { loggedOut: 1, left: 1, ...neededDataTypes} },
      ).fetch();
    }

    let streams = VideoStreams.find(
      { meetingId: Auth.meetingID },
      { fields: neededDataTypes },
    ).fetch();

    // Data savings enabled will only show local streams
    const { viewParticipantsWebcams } = Settings.dataSaving;
    if (!viewParticipantsWebcams) streams = this.filterLocalOnly(streams);

    const connectingStream = this.getConnectingStream(streams);
    if (connectingStream) streams.push(connectingStream);

    // Pagination is either explicitly disabled or pagination is set to 0 (which
    // is equivalent to disabling it), so return the mapped streams as they are
    // which produces the original non paginated behaviour
    if (isPaginationDisabled) {
      if (isGridEnabled) {
        const streamUsers = streams.map((stream) => stream.userId);

        gridUsers = users.filter(
          (user) => !user.loggedOut && !user.left && !streamUsers.includes(user.userId)
        ).map((user) => ({
          isGridItem: true,
          ...user,
        }));
      }

      return {
        streams: sortVideoStreams(streams, DEFAULT_SORTING),
        gridUsers,
        totalNumberOfStreams: streams.length
      };
    }

    const paginatedStreams = this.getVideoPage(streams, pageSize);

    if (isGridEnabled) {
      const streamUsers = paginatedStreams.map((stream) => stream.userId);

      gridUsers = users.filter(
        (user) => !user.loggedOut && !user.left && !streamUsers.includes(user.userId)
      ).map((user) => ({
        isGridItem: true,
        ...user,
      }));
    }

    return { streams: paginatedStreams, gridUsers, totalNumberOfStreams: streams.length };
  }

  fetchVideoStreams() {
    const pageSize = this.getMyPageSize();
    const isPaginationDisabled = !this.isPaginationEnabled() || pageSize === 0;

    let streams = [...VideoStreams.find(
      { meetingId: Auth.meetingID },
    ).fetch()];

    const { viewParticipantsWebcams } = Settings.dataSaving;
    if (!viewParticipantsWebcams) streams = this.filterLocalOnly(streams);

    const connectingStream = this.getConnectingStream(streams);
    if (connectingStream) {
      streams.push(connectingStream);
    }

    if (!isPaginationDisabled) {
      return this.getVideoPage(streams, pageSize);
    }

    return streams;
  }

  getGridUsers(users, streams) {
    const isGridEnabled = this.isGridEnabled();
    const gridSize = this.getGridSize();

    let gridUsers = [];

    if (isGridEnabled) {
      const streamUsers = streams.map((stream) => stream.userId);

      gridUsers = users.filter(
        (user) => !user.loggedOut && !user.left && !streamUsers.includes(user.userId),
      ).map((user) => ({
        isGridItem: true,
        ...user,
      })).slice(0, gridSize - streams.length);
    }
    return gridUsers;
  }

  stopConnectingStream() {
    this.deviceId = null;
    this.isConnecting = false;
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
          this.stopConnectingStream();
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

  getMediaServerAdapter() {
    return getFromMeetingSettings('media-server-video', DEFAULT_VIDEO_MEDIA_SERVER);
  }

  getMyRole () {
    return Users.findOne({ userId: Auth.userID },
      { fields: { role: 1 } })?.role;
  }

  getRecord() {
    if (this.record === null) {
      this.record = getFromUserSettings('bbb_record_video', true);
    }

    // TODO: Remove this
    // This is a hack to handle a missing piece at the backend of a particular deploy.
    // If, at the time the video is shared, the user has a viewer role and
    // meta_hack-record-viewer-video is 'false' this user won't have this video
    // stream recorded.
    if (this.hackRecordViewer === null) {
      const value = getFromMeetingSettings('hack-record-viewer-video', null);
      this.hackRecordViewer = value ? value.toLowerCase() === 'true' : true;
    }

    const hackRecord = this.getMyRole() === ROLE_MODERATOR || this.hackRecordViewer;

    return this.record && hackRecord;
  }

  filterModeratorOnly(streams) {
    const amIViewer = this.getMyRole() === ROLE_VIEWER;

    if (amIViewer) {
      const moderators = Users.find(
        {
          role: ROLE_MODERATOR,
        },
        { fields: { userId: 1 } },
      ).fetch().map(user => user.userId);

      return streams.reduce((result, stream) => {
        const { userId } = stream;

        const isModerator = moderators.includes(userId);
        const isMe = Auth.userID === userId;

        if (isModerator || isMe) result.push(stream);

        return result;
      }, []);
    }
    return streams;
  }

  filterLocalOnly(streams) {
    return streams.filter(stream => stream.userId === Auth.userID);
  }

  disableCam() {
    const m = Meetings.findOne({ meetingId: Auth.meetingID },
      { fields: { 'lockSettings.disableCam': 1 } });
    return m.lockSettings ? m.lockSettings.disableCam : false;
  }

  webcamsOnlyForModerator() {
    const meeting = Meetings.findOne({ meetingId: Auth.meetingID },
      { fields: { 'usersPolicies.webcamsOnlyForModerator': 1 } });
    const user = Users.findOne({ userId: Auth.userID }, { fields: { locked: 1, role: 1 } });

    if (meeting?.usersPolicies && user?.role !== ROLE_MODERATOR && user?.locked) {
      return meeting.usersPolicies.webcamsOnlyForModerator;
    }
    return false;
  }

  hasCapReached() {
    const meeting = Meetings.findOne(
      { meetingId: Auth.meetingID },
      {
        fields: {
          meetingCameraCap: 1,
          'usersPolicies.userCameraCap': 1,
        },
      },
    );

    // If the meeting prop data is unreachable, force a safe return
    if (
      meeting?.usersPolicies === undefined
      || !meeting?.meetingCameraCap === undefined
    ) return true;
    const { meetingCameraCap } = meeting;
    const { userCameraCap } = meeting.usersPolicies;

    const meetingCap = meetingCameraCap !== 0 && this.getVideoStreamsCount() >= meetingCameraCap;
    const userCap = userCameraCap !== 0 && this.getLocalVideoStreamsCount() >= userCameraCap;

    return meetingCap || userCap;
  }

  getVideoStreamsCount() {
    const streams = VideoStreams.find({}).count();

    return streams;
  }

  getLocalVideoStreamsCount() {
    const localStreams = VideoStreams.find(
      { userId: Auth.userID }
    ).count();

    return localStreams;
  }

  getInfo() {
    const m = Meetings.findOne({ meetingId: Auth.meetingID },
      { fields: { 'voiceSettings.voiceConf': 1 } });
    const voiceBridge = m.voiceSettings ? m.voiceSettings.voiceConf : null;
    return {
      userId: Auth.userID,
      userName: Auth.fullname,
      meetingId: Auth.meetingID,
      sessionToken: Auth.sessionToken,
      voiceBridge,
    };
  }

  mirrorOwnWebcam(userId = null) {
    // only true if setting defined and video ids match
    const isOwnWebcam = userId ? Auth.userID === userId : true;
    const isEnabledMirroring = getFromUserSettings('bbb_mirror_own_webcam', MIRROR_WEBCAM);
    return isOwnWebcam && isEnabledMirroring;
  }

  isPinEnabled() {
    return PIN_WEBCAM;
  }

  // In user-list it is necessary to check if the user is sharing his webcam
  isVideoPinEnabledForCurrentUser(isModerator) {
    const isBreakout = meetingIsBreakout();
    const isPinEnabled = this.isPinEnabled();

    return !!(isModerator
      && isPinEnabled
      && !isBreakout);
  }

  getMyStreamId(deviceId) {
    const videoStream = VideoStreams.findOne(
      {
        meetingId: Auth.meetingID,
        userId: Auth.userID,
        deviceId,
      }, { fields: { stream: 1 } },
    );
    return videoStream ? videoStream.stream : null;
  }

  isUserLocked() {
    return !!Users.findOne({
      userId: Auth.userID,
      locked: true,
      role: { $ne: ROLE_MODERATOR },
    }, { fields: {} }) && this.disableCam();
  }

  lockUser(sendUserUnshareWebcam) {
    if (this.isConnected) {
      this.exitVideo(sendUserUnshareWebcam);
    }
  }

  isLocalStream(cameraId) {
    return cameraId?.startsWith(Auth.userID);
  }

  playStart(cameraId) {
    if (this.isLocalStream(cameraId)) {
      this.sendUserShareWebcam(cameraId);
      this.joinedVideo();
    }
  }

  getCameraProfile() {
    const profileId = BBBStorage.getItem('WebcamProfileId') || '';
    const cameraProfile = CAMERA_PROFILES.find(profile => profile.id === profileId)
      || CAMERA_PROFILES.find(profile => profile.default)
      || CAMERA_PROFILES[0];
    const deviceId = BBBStorage.getItem('WebcamDeviceId');
    if (deviceId) {
      cameraProfile.constraints = cameraProfile.constraints || {};
      cameraProfile.constraints.deviceId = { exact: deviceId };
    }

    return cameraProfile;
  }

  addCandidateToPeer(peer, candidate, cameraId) {
    peer.addIceCandidate(candidate).catch((error) => {
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

  onBeforeUnload(sendUserUnshareWebcam) {
    this.exitVideo(sendUserUnshareWebcam);
  }

  getStatus() {
    if (this.isConnecting) return 'videoConnecting';
    if (this.isConnected) return 'connected';
    return 'disconnected';
  }

  disableReason() {
    const locks = {
      videoLocked: this.isUserLocked(),
      camCapReached: this.hasCapReached() && !this.hasVideoStream(),
      meteorDisconnected: !Meteor.status().connected
    };
    const locksKeys = Object.keys(locks);
    const disableReason = locksKeys.filter( i => locks[i]).shift();
    return disableReason ? disableReason : false;
  }

  getRole(isLocal) {
    return isLocal ? 'share' : 'viewer';
  }

  getUserParameterProfile() {
    if (this.userParameterProfile === null) {
      this.userParameterProfile = getFromUserSettings(
        'bbb_preferred_camera_profile',
        (CAMERA_PROFILES.find(i => i.default) || {}).id || null,
      );
    }

    return this.userParameterProfile;
  }

  isMultipleCamerasEnabled() {
    // Multiple cameras shouldn't be enabled with video preview skipping
    // Mobile shouldn't be able to share more than one camera at the same time
    // Safari needs to implement devicechange event for safe device control
    return MULTIPLE_CAMERAS
      && !VideoPreviewService.getSkipVideoPreview()
      && !this.isMobile
      && !this.isSafari
      && this.numberOfDevices > 1;
  }

  isProfileBetter (newProfileId, originalProfileId) {
    return CAMERA_PROFILES.findIndex(({ id }) => id === newProfileId)
      > CAMERA_PROFILES.findIndex(({ id }) => id === originalProfileId);
  }

  applyBitrate (peer, bitrate) {
    const peerConnection = peer.peerConnection;
    if ('RTCRtpSender' in window
      && 'setParameters' in window.RTCRtpSender.prototype
      && 'getParameters' in window.RTCRtpSender.prototype) {
      peerConnection.getSenders().forEach(sender => {
        const { track } = sender;
        if (track && track.kind === 'video') {
          const parameters = sender.getParameters();
          const normalizedBitrate = bitrate * 1000;

          // The encoder parameters might not be up yet; if that's the case,
          // add a filler object so we can alter the parameters anyways
          if (parameters.encodings == null || parameters.encodings.length === 0) {
            parameters.encodings = [{}];
          }

          // Only reset bitrate if it changed in some way to avoid encoder fluctuations
          if (parameters.encodings[0].maxBitrate !== normalizedBitrate) {
            parameters.encodings[0].maxBitrate = normalizedBitrate;
            sender.setParameters(parameters)
              .then(() => {
                logger.info({
                  logCode: 'video_provider_bitratechange',
                  extraInfo: { bitrate },
                }, `Bitrate changed: ${bitrate}`);
              })
              .catch(error => {
                logger.warn({
                  logCode: 'video_provider_bitratechange_failed',
                  extraInfo: { bitrate, errorMessage: error.message, errorCode: error.code },
                }, `Bitrate change failed.`);
              });
          }
        }
      })
    }
  }

  // Some browsers (mainly iOS Safari) garble the stream if a constraint is
  // reconfigured without propagating previous height/width info
  reapplyResolutionIfNeeded (track, constraints) {
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

  applyCameraProfile (peer, profileId) {
    const profile = CAMERA_PROFILES.find((targetProfile) => targetProfile.id === profileId);

    // When this should be skipped:
    // 1 - Badly defined profile
    // 2 - Badly defined peer (ie {})
    // 3 - The target profile is already applied
    // 4 - The targetr profile is better than the original profile
    if (!profile
      || peer == null
      || peer.peerConnection == null
      || peer.currentProfileId === profileId
      || this.isProfileBetter(profileId, peer.originalProfileId)) {
      return;
    }

    const { bitrate, constraints } = profile;

    if (bitrate) this.applyBitrate(peer, bitrate);

    if (CAMERA_QUALITY_THR_CONSTRAINTS
      && constraints
      && typeof constraints === 'object'
    ) {
      peer.peerConnection.getSenders().forEach((sender) => {
        const { track } = sender;
        if (track && track.kind === 'video' && typeof track.applyConstraints === 'function') {
          const normalizedVideoConstraints = this.reapplyResolutionIfNeeded(track, constraints);
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

    peer.currentProfileId = profileId;
  }

  getThreshold (numberOfPublishers) {
    let targetThreshold = { threshold: 0, profile: 'original' };
    let finalThreshold = { threshold: 0, profile: 'original' };

    for(let mapIndex = 0; mapIndex < CAMERA_QUALITY_THRESHOLDS.length; mapIndex++) {
      targetThreshold = CAMERA_QUALITY_THRESHOLDS[mapIndex];
      if (targetThreshold.threshold <= numberOfPublishers) {
        finalThreshold = targetThreshold;
      }
    }

    return finalThreshold;
  }

  getPreloadedStream () {
    if (this.deviceId == null) return;
    return VideoPreviewService.getStream(this.deviceId);
  }

  /**
   * Get all active video peers.
   * @returns An Object containing the reference for all active peers peers
   */
  getActivePeers() {
    const videoData = this.getVideoStreams();

    if (!videoData) return null;

    const { streams: activeVideoStreams } = videoData;

    if (!activeVideoStreams) return null;

    const activePeers = {};

    activeVideoStreams.forEach((stream) => {
      if (this.webRtcPeersRef[stream.stream]) {
        activePeers[stream.stream] = this.webRtcPeersRef[stream.stream].peerConnection;
      }
    });

    return activePeers;
  }

  /**
   * Get stats about all active video peer.
   * We filter the status based on FILTER_VIDEO_STATS constant.
   *
   * For more information see:
   * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/getStats
   * and
   * https://developer.mozilla.org/en-US/docs/Web/API/RTCStatsReport
   * @returns An Object containing the information about each active peer.
   *          The returned object follows the format:
   *          {
   *            peerId: RTCStatsReport
   *          }
   */
  async getStats() {
    const peers = this.getActivePeers();

    if (!peers) return null;

    const stats = {};

    await Promise.all(
      Object.keys(peers).map(async (peerId) => {
        const peerStats = await peers[peerId].getStats();

        const videoStats = {};

        peerStats.forEach((stat) => {
          if (FILTER_VIDEO_STATS.includes(stat.type)) {
            videoStats[stat.type] = stat;
          }
        });
        stats[peerId] = videoStats;
      })
    );

    return stats;
  }

  updatePeerDictionaryReference(newRef) {
    this.webRtcPeersRef = newRef;
  }
}

const videoService = new VideoService();

export default {
  storeDeviceIds: () => videoService.storeDeviceIds(),
  exitVideo: (sendUserUnshareWebcam) => videoService.exitVideo(sendUserUnshareWebcam),
  joinVideo: deviceId => videoService.joinVideo(deviceId),
  stopVideo: (cameraId, sendUserUnshareWebcam) => videoService.stopVideo(
    cameraId,
    sendUserUnshareWebcam,
  ),
  getVideoStreams: () => videoService.getVideoStreams(),
  getInfo: () => videoService.getInfo(),
  getMyStreamId: deviceId => videoService.getMyStreamId(deviceId),
  isUserLocked: () => videoService.isUserLocked(),
  lockUser: (sendUserUnshareWebcam) => videoService.lockUser(sendUserUnshareWebcam),
  getAuthenticatedURL: () => videoService.getAuthenticatedURL(),
  isLocalStream: cameraId => videoService.isLocalStream(cameraId),
  hasVideoStream: () => videoService.hasVideoStream(),
  getStatus: () => videoService.getStatus(),
  disableReason: () => videoService.disableReason(),
  playStart: cameraId => videoService.playStart(cameraId),
  getCameraProfile: () => videoService.getCameraProfile(),
  addCandidateToPeer: (peer, candidate, cameraId) => videoService.addCandidateToPeer(peer, candidate, cameraId),
  processInboundIceQueue: (peer, cameraId) => videoService.processInboundIceQueue(peer, cameraId),
  getRole: isLocal => videoService.getRole(isLocal),
  getMediaServerAdapter: () => videoService.getMediaServerAdapter(),
  getRecord: () => videoService.getRecord(),
  getSharedDevices: () => videoService.getSharedDevices(),
  getUserParameterProfile: () => videoService.getUserParameterProfile(),
  isMultipleCamerasEnabled: () => videoService.isMultipleCamerasEnabled(),
  mirrorOwnWebcam: userId => videoService.mirrorOwnWebcam(userId),
  hasCapReached: () => videoService.hasCapReached(),
  onBeforeUnload: (sendUserUnshareWebcam) => videoService.onBeforeUnload(sendUserUnshareWebcam),
  notify: message => notify(message, 'error', 'video'),
  updateNumberOfDevices: devices => videoService.updateNumberOfDevices(devices),
  applyCameraProfile: debounce(
    videoService.applyCameraProfile.bind(videoService),
    CAMERA_QUALITY_THR_DEBOUNCE,
    { leading: false, trailing: true },
  ),
  getThreshold: (numberOfPublishers) => videoService.getThreshold(numberOfPublishers),
  isPaginationEnabled: () => videoService.isPaginationEnabled(),
  getNumberOfPages: () => videoService.getNumberOfPages(),
  getCurrentVideoPageIndex: () => videoService.getCurrentVideoPageIndex(),
  getPreviousVideoPage: () => videoService.getPreviousVideoPage(),
  getNextVideoPage: () => videoService.getNextVideoPage(),
  getPageChangeDebounceTime: () => { return PAGE_CHANGE_DEBOUNCE_TIME },
  getUsersIdFromVideoStreams: () => videoService.getUsersIdFromVideoStreams(),
  shouldRenderPaginationToggle: () => videoService.shouldRenderPaginationToggle(),
  getVideoPinByUser: (userId) => videoService.getVideoPinByUser(userId),
  isVideoPinEnabledForCurrentUser: (user) => videoService.isVideoPinEnabledForCurrentUser(user),
  isPinEnabled: () => videoService.isPinEnabled(),
  getPreloadedStream: () => videoService.getPreloadedStream(),
  getStats: () => videoService.getStats(),
  updatePeerDictionaryReference: (newRef) => videoService.updatePeerDictionaryReference(newRef),
  joinedVideo: () => videoService.joinedVideo(),
  fetchVideoStreams: () => videoService.fetchVideoStreams(),
  getGridUsers: (users = [], streams = []) => videoService.getGridUsers(users, streams),
  webcamsOnlyForModerators: () => videoService.webcamsOnlyForModerator(),
};

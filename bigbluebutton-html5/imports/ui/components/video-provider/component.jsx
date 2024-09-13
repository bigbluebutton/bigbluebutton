/* eslint react/sort-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { defineMessages, injectIntl } from 'react-intl';
import { debounce } from '/imports/utils/debounce';
import VideoService from './service';
import VideoListContainer from './video-list/container';
import {
  fetchWebRTCMappedStunTurnServers,
  getMappedFallbackStun,
} from '/imports/utils/fetchStunTurnServers';
import logger from '/imports/startup/client/logger';
import { notifyStreamStateChange } from '/imports/ui/services/bbb-webrtc-sfu/stream-state-service';
import VideoPreviewService from '../video-preview/service';
import MediaStreamUtils from '/imports/utils/media-stream-utils';
import BBBVideoStream from '/imports/ui/services/webrtc-base/bbb-video-stream';
import {
  EFFECT_TYPES,
  getSessionVirtualBackgroundInfoWithDefault,
} from '/imports/ui/services/virtual-background/service';
import { notify } from '/imports/ui/services/notification';
import { shouldForceRelay } from '/imports/ui/services/bbb-webrtc-sfu/utils';
import WebRtcPeer from '/imports/ui/services/webrtc-base/peer';

// Default values and default empty object to be backwards compat with 2.2.
// FIXME Remove hardcoded defaults 2.3.
const {
  connectionTimeout: WS_CONN_TIMEOUT = 4000,
  maxRetries: WS_MAX_RETRIES = 5,
  debug: WS_DEBUG,
  heartbeat: WS_HEARTBEAT_OPTS = {
    interval: 15000,
    delay: 3000,
    reconnectOnFailure: true,
  },
} = Meteor.settings.public.kurento.cameraWsOptions;

const { webcam: NETWORK_PRIORITY } = Meteor.settings.public.media.networkPriorities || {};
const {
  baseTimeout: CAMERA_SHARE_FAILED_WAIT_TIME = 15000,
  maxTimeout: MAX_CAMERA_SHARE_FAILED_WAIT_TIME = 60000,
} = Meteor.settings.public.kurento.cameraTimeouts || {};
const {
  enabled: CAMERA_QUALITY_THRESHOLDS_ENABLED = true,
  privilegedStreams: CAMERA_QUALITY_THR_PRIVILEGED = true,
} = Meteor.settings.public.kurento.cameraQualityThresholds;
const SIGNAL_CANDIDATES = Meteor.settings.public.kurento.signalCandidates;
const TRACE_LOGS = Meteor.settings.public.kurento.traceLogs;
const GATHERING_TIMEOUT = Meteor.settings.public.kurento.gatheringTimeout;
const {
  enabled: RESTART_ICE = false,
  retries: RESTART_ICE_RETRIES = 3,
} = Meteor.settings.public.kurento?.restartIce?.video || {};

const intlClientErrors = defineMessages({
  permissionError: {
    id: 'app.video.permissionError',
    description: 'Webcam permission error',
  },
  iceConnectionStateError: {
    id: 'app.video.iceConnectionStateError',
    description: 'Ice connection state failed',
  },
  mediaFlowTimeout: {
    id: 'app.video.mediaFlowTimeout1020',
    description: 'Media flow timeout',
  },
  mediaTimedOutError: {
    id: 'app.video.mediaTimedOutError',
    description: 'Media was ejected by the server due to lack of valid media',
  },
  virtualBgGenericError: {
    id: 'app.video.virtualBackground.genericError',
    description: 'Failed to apply camera effect',
  },
  inactiveError: {
    id: 'app.video.inactiveError',
    description: 'Camera stopped unexpectedly',
  },
});

const intlSFUErrors = defineMessages({
  2000: {
    id: 'app.sfu.mediaServerConnectionError2000',
    description: 'SFU connection to the media server',
  },
  2001: {
    id: 'app.sfu.mediaServerOffline2001',
    description: 'SFU is offline',
  },
  2002: {
    id: 'app.sfu.mediaServerNoResources2002',
    description: 'Media server lacks disk, CPU or FDs',
  },
  2003: {
    id: 'app.sfu.mediaServerRequestTimeout2003',
    description: 'Media requests timeout due to lack of resources',
  },
  2021: {
    id: 'app.sfu.serverIceGatheringFailed2021',
    description: 'Server cannot enact ICE gathering',
  },
  2022: {
    id: 'app.sfu.serverIceStateFailed2022',
    description: 'Server endpoint transitioned to a FAILED ICE state',
  },
  2200: {
    id: 'app.sfu.mediaGenericError2200',
    description: 'SFU component generated a generic error',
  },
  2202: {
    id: 'app.sfu.invalidSdp2202',
    description: 'Client provided an invalid SDP',
  },
  2203: {
    id: 'app.sfu.noAvailableCodec2203',
    description: 'Server has no available codec for the client',
  },
});

const propTypes = {
  streams: PropTypes.arrayOf(Array).isRequired,
  intl: PropTypes.objectOf(Object).isRequired,
  isUserLocked: PropTypes.bool.isRequired,
  swapLayout: PropTypes.bool.isRequired,
  currentVideoPageIndex: PropTypes.number.isRequired,
  totalNumberOfStreams: PropTypes.number.isRequired,
  isMeteorConnected: PropTypes.bool.isRequired,
};

class VideoProvider extends Component {
  static onBeforeUnload() {
    VideoService.onBeforeUnload();
  }

  static shouldAttachVideoStream(peer, videoElement) {
    // Conditions to safely attach a stream to a video element in all browsers:
    // 1 - Peer exists, video element exists
    // 2 - Target stream differs from videoElement's (diff)
    // 3a - If the stream is a remote one, the safest (*ahem* Safari) moment to
    //      do so is waiting for the server to confirm that media has flown out of it
    //      towards te remote end (peer.started)
    // 3b - If the stream is a local one (webcam sharer) and is started
    // 4 - If the stream is local one, check if there area video tracks there are
    //     video tracks: attach it
    if (peer == null || videoElement == null) return false;
    const stream = peer.isPublisher ? peer.getLocalStream() : peer.getRemoteStream();
    const diff = stream && (stream.id !== videoElement.srcObject?.id || !videoElement.paused);

    if (peer.started && diff) return true;

    return peer.isPublisher
      && peer.getLocalStream()
      && peer.getLocalStream().getVideoTracks().length > 0
      && diff;
  }

  constructor(props) {
    super(props);

    // socketOpen state is there to force update when the signaling socket opens or closes
    this.state = {
      socketOpen: false,
    };
    this._isMounted = false;
    this.info = VideoService.getInfo();
    // Signaling message queue arrays indexed by stream (== cameraId)
    this.wsQueues = {};
    this.restartTimeout = {};
    this.restartTimer = {};
    this.webRtcPeers = {};
    this.outboundIceQueues = {};
    this.videoTags = {};

    this.createVideoTag = this.createVideoTag.bind(this);
    this.destroyVideoTag = this.destroyVideoTag.bind(this);
    this.onWsOpen = this.onWsOpen.bind(this);
    this.onWsClose = this.onWsClose.bind(this);
    this.onWsMessage = this.onWsMessage.bind(this);
    this.updateStreams = this.updateStreams.bind(this);
    this.connectStreams = this.connectStreams.bind(this);
    this.debouncedConnectStreams = debounce(
      this.connectStreams,
      VideoService.getPageChangeDebounceTime(),
      { leading: false, trailing: true },
    );
    this.startVirtualBackgroundByDrop = this.startVirtualBackgroundByDrop.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    VideoService.updatePeerDictionaryReference(this.webRtcPeers);
    this.ws = this.openWs();
    window.addEventListener('beforeunload', VideoProvider.onBeforeUnload);
  }

  componentDidUpdate(prevProps) {
    const {
      isUserLocked,
      streams,
      currentVideoPageIndex,
      isMeteorConnected
    } = this.props;
    const { socketOpen } = this.state;

    // Only debounce when page changes to avoid unecessary debouncing
    const shouldDebounce = VideoService.isPaginationEnabled()
      && prevProps.currentVideoPageIndex !== currentVideoPageIndex;

    if (isMeteorConnected && socketOpen) this.updateStreams(streams, shouldDebounce);
    if (!prevProps.isUserLocked && isUserLocked) VideoService.lockUser();

    // Signaling socket expired its retries and meteor is connected - create
    // a new signaling socket instance from scratch
    if (!socketOpen
      && isMeteorConnected
      && this.ws == null) {
      this.ws = this.openWs();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    VideoService.updatePeerDictionaryReference({});

    if (this.ws) {
      this.ws.onmessage = null;
      this.ws.onopen = null;
      this.ws.onclose = null;
    }

    window.removeEventListener('beforeunload', VideoProvider.onBeforeUnload);
    VideoService.exitVideo();
    Object.keys(this.webRtcPeers).forEach((stream) => {
      this.stopWebRTCPeer(stream, false);
    });
    this.terminateWs();
  }

  openWs() {
    const ws = new ReconnectingWebSocket(
      VideoService.getAuthenticatedURL(), [], {
        connectionTimeout: WS_CONN_TIMEOUT,
        debug: WS_DEBUG,
        maxRetries: WS_MAX_RETRIES,
        maxEnqueuedMessages: 0,
      }
    );
    ws.onopen = this.onWsOpen;
    ws.onclose = this.onWsClose;
    ws.onmessage = this.onWsMessage;

    return ws;
  }

  terminateWs() {
    if (this.ws) {
      this.clearWSHeartbeat();
      this.ws.close();
      this.ws = null;
    }
  }

  _updateLastMsgTime() {
    this.ws.isAlive = true;
    this.ws.lastMsgTime = Date.now();
  }

  _getTimeSinceLastMsg() {
    return Date.now() - this.ws.lastMsgTime;
  }

  setupWSHeartbeat() {
    if (WS_HEARTBEAT_OPTS.interval === 0 || this.ws == null || this.ws.wsHeartbeat) return;

    this.ws.isAlive = true;
    this.ws.wsHeartbeat = setInterval(() => {
      if (this.ws.isAlive === false) {
        logger.warn({
          logCode: 'video_provider_ws_heartbeat_failed',
        }, 'Video provider WS heartbeat failed.');

        if (WS_HEARTBEAT_OPTS.reconnectOnFailure) this.ws.reconnect();
        return;
      }

      if (this._getTimeSinceLastMsg() < (
        WS_HEARTBEAT_OPTS.interval - WS_HEARTBEAT_OPTS.delay
      )) {
        return;
      }

      this.ws.isAlive = false;
      this.ping();
    }, WS_HEARTBEAT_OPTS.interval);

    this.ping();
  }

  clearWSHeartbeat() {
    if (this.ws?.wsHeartbeat) {
      clearInterval(this.ws.wsHeartbeat);
      this.ws.wsHeartbeat = null;
    }
  }

  onWsMessage(message) {
    this._updateLastMsgTime();
    const parsedMessage = JSON.parse(message.data);

    if (parsedMessage.id === 'pong') return;

    switch (parsedMessage.id) {
      case 'startResponse':
        this.startResponse(parsedMessage);
        break;

      case 'playStart':
        this.handlePlayStart(parsedMessage);
        break;

      case 'playStop':
        this.handlePlayStop(parsedMessage);
        break;

      case 'iceCandidate':
        this.handleIceCandidate(parsedMessage);
        break;

      case 'restartIceResponse':
        this.handleRestartIceResponse(parsedMessage);
        break;

      case 'pong':
        break;

      case 'error':
      default:
        this.handleSFUError(parsedMessage);
        break;
    }
  }

  onWsClose() {
    logger.info({
      logCode: 'video_provider_onwsclose',
    }, 'Multiple video provider websocket connection closed.');

    this.clearWSHeartbeat();
    VideoService.exitVideo();
    // Media is currently tied to signaling state  - so if signaling shuts down,
    // media will shut down server-side. This cleans up our local state faster
    // and notify the state change as failed so the UI rolls back to the placeholder
    // avatar UI in the camera container
    Object.keys(this.webRtcPeers).forEach((stream) => {
      if (this.stopWebRTCPeer(stream, false)) {
        notifyStreamStateChange(stream, 'failed');
      }
    });
    this.setState({ socketOpen: false });

    if (this.ws && this.ws.retryCount >= WS_MAX_RETRIES) {
      this.terminateWs();
    }
  }

  onWsOpen() {
    logger.info({
      logCode: 'video_provider_onwsopen',
    }, 'Multiple video provider websocket connection opened.');

    this._updateLastMsgTime();
    this.setupWSHeartbeat();
    this.setState({ socketOpen: true });
    // Resend queued messages that happened when socket was not connected
    Object.entries(this.wsQueues).forEach(([stream, queue]) => {
      if (this.webRtcPeers[stream]) {
        // Peer - send enqueued
        while (queue.length > 0) {
          this.sendMessage(queue.pop());
        }
      } else {
        // No peer - delete queue
        this.wsQueues[stream] = null;
      }
    });
  }

  findAllPrivilegedStreams () {
    const { streams } = this.props;
    // Privileged streams are: floor holders, pinned users
    return streams.filter(stream => stream.floor || stream.pin);
  }

  updateQualityThresholds(numberOfPublishers) {
    const { threshold, profile } = VideoService.getThreshold(numberOfPublishers);
    if (profile) {
      const privilegedStreams = this.findAllPrivilegedStreams();
      Object.values(this.webRtcPeers)
        .filter(peer => peer.isPublisher)
        .forEach((peer) => {
          // Conditions which make camera revert their original profile
          // 1) Threshold 0 means original profile/inactive constraint
          // 2) Privileged streams
          const exempt = threshold === 0
            || (CAMERA_QUALITY_THR_PRIVILEGED && privilegedStreams.some(vs => vs.stream === peer.stream))
          const profileToApply = exempt ? peer.originalProfileId : profile;
          VideoService.applyCameraProfile(peer, profileToApply);
        });
    }
  }

  getStreamsToConnectAndDisconnect(streams) {
    const streamsCameraIds = streams.filter(s => !s?.isGridItem).map(s => s.stream);
    const streamsConnected = Object.keys(this.webRtcPeers);

    const streamsToConnect = streamsCameraIds.filter(stream => {
      return !streamsConnected.includes(stream);
    });

    const streamsToDisconnect = streamsConnected.filter(stream => {
      return !streamsCameraIds.includes(stream);
    });

    return [streamsToConnect, streamsToDisconnect];
  }

  connectStreams(streamsToConnect) {
    streamsToConnect.forEach((stream) => {
      const isLocal = VideoService.isLocalStream(stream);
      this.createWebRTCPeer(stream, isLocal);
    });
  }

  disconnectStreams(streamsToDisconnect) {
    streamsToDisconnect.forEach(stream => this.stopWebRTCPeer(stream, false));
  }

  updateStreams(streams, shouldDebounce = false) {
    const [streamsToConnect, streamsToDisconnect] = this.getStreamsToConnectAndDisconnect(streams);

    if (shouldDebounce) {
      this.debouncedConnectStreams(streamsToConnect);
    } else {
      this.connectStreams(streamsToConnect);
    }

    this.disconnectStreams(streamsToDisconnect);

    if (CAMERA_QUALITY_THRESHOLDS_ENABLED) {
      this.updateQualityThresholds(this.props.totalNumberOfStreams);
    }
  }

  ping() {
    const message = { id: 'ping' };
    this.sendMessage(message);
  }

  sendMessage(message) {
    const { ws } = this;

    if (this.connectedToMediaServer()) {
      const jsonMessage = JSON.stringify(message);
      try {
        ws.send(jsonMessage);
      } catch (error) {
        logger.error({
          logCode: 'video_provider_ws_send_error',
          extraInfo: {
            errorMessage: error.message || 'Unknown',
            errorCode: error.code,
          },
        }, 'Camera request failed to be sent to SFU');
      }
    } else if (message.id !== 'stop') {
      // No need to queue video stop messages
      const { cameraId } = message;
      if (cameraId) {
        if (this.wsQueues[cameraId] == null) this.wsQueues[cameraId] = [];
        this.wsQueues[cameraId].push(message);
      }
    }
  }

  connectedToMediaServer() {
    return this.ws && this.ws.readyState === ReconnectingWebSocket.OPEN;
  }

  processOutboundIceQueue(peer, role, stream) {
    const queue = this.outboundIceQueues[stream];
    while (queue && queue.length) {
      const candidate = queue.shift();
      this.sendIceCandidateToSFU(peer, role, candidate, stream);
    }
  }

  sendLocalAnswer (peer, stream, answer) {
    const message = {
      id: 'subscriberAnswer',
      type: 'video',
      role: VideoService.getRole(peer.isPublisher),
      cameraId: stream,
      answer,
    };

    this.sendMessage(message);
  }

  requestRestartIce(peer, stream) {
    if (peer == null) {
      throw new Error('No peer to restart ICE');
    }

    if (peer.vpRestartIceRetries >= RESTART_ICE_RETRIES) {
      throw new Error('Max ICE restart retries reached');
    }

    const role = VideoService.getRole(peer.isPublisher);
    const message = {
      id: 'restartIce',
      type: 'video',
      cameraId: stream,
      role,
    };

    // eslint-disable-next-line no-param-reassign
    peer.vpRestartIceRetries += 1;
    logger.warn({
      logCode: 'video_provider_restart_ice',
      extraInfo: {
        cameraId: stream,
        role,
        restartIceRetries: peer.vpRestartIceRetries,
      },
    }, `Requesting ICE restart (${peer.vpRestartIceRetries}/${RESTART_ICE_RETRIES})`);
    this.sendMessage(message);
  }

  startResponse(message) {
    const { cameraId: stream, role } = message;
    const peer = this.webRtcPeers[stream];

    logger.debug({
      logCode: 'video_provider_start_response_success',
      extraInfo: { cameraId: stream, role },
    }, `Camera start request accepted by SFU. Role: ${role}`);

    if (peer) {
      const processorFunc = peer.isPublisher
        ? peer.processAnswer.bind(peer)
        : peer.processOffer.bind(peer);

      processorFunc(message.sdpAnswer).then((answer) => {
        if (answer) this.sendLocalAnswer(peer, stream, answer);

        peer.didSDPAnswered = true;
        this.processOutboundIceQueue(peer, role, stream);
        VideoService.processInboundIceQueue(peer, stream);
      }).catch((error) => {
        logger.error({
          logCode: 'video_provider_peerconnection_process_error',
          extraInfo: {
            cameraId: stream,
            role,
            errorMessage: error.message,
            errorCode: error.code,
          },
        }, 'Camera answer processing failed');
      });
    } else {
      logger.warn({
        logCode: 'video_provider_startresponse_no_peer',
        extraInfo: { cameraId: stream, role },
      }, 'No peer on SFU camera start response handler');
    }
  }

  handleIceCandidate(message) {
    const { cameraId: stream, candidate } = message;
    const peer = this.webRtcPeers[stream];

    if (peer) {
      if (peer.didSDPAnswered) {
        VideoService.addCandidateToPeer(peer, candidate, stream);
      } else {
        // ICE candidates are queued until a SDP answer has been processed.
        // This was done due to a long term iOS/Safari quirk where it'd
        // fail if candidates were added before the offer/answer cycle was completed.
        // Dunno if that still happens, but it works even if it slows the ICE checks
        // a bit  - prlanzarin july 2019
        if (peer.inboundIceQueue == null) {
          peer.inboundIceQueue = [];
        }
        peer.inboundIceQueue.push(candidate);
      }
    } else {
      logger.warn({
        logCode: 'video_provider_addicecandidate_no_peer',
        extraInfo: { cameraId: stream },
      }, 'Trailing camera ICE candidate, discarded');
    }
  }

  handleRestartIceResponse(message) {
    const { cameraId: stream, sdp } = message;
    const peer = this.webRtcPeers[stream];

    if (peer) {
      peer?.restartIce(sdp, peer?.isPublisher)
        .catch((error) => {
          const { peerConnection } = peer;

          if (peerConnection) peerConnection.onconnectionstatechange = null;

          logger.error({
            logCode: 'video_provider_restart_ice_error',
            extraInfo: {
              errorMessage: error?.message,
              errorCode: error?.code,
              errorName: error?.name,
              cameraId: stream,
              role: VideoService.getRole(peer?.isPublisher),
            },
          }, `ICE restart failed for camera ${stream}`);
          this._onWebRTCError(
            new Error('iceConnectionStateError'),
            stream,
            VideoService.isLocalStream(stream),
          );
        });
    }
  }

  clearRestartTimers(stream) {
    if (this.restartTimeout[stream]) {
      clearTimeout(this.restartTimeout[stream]);
      delete this.restartTimeout[stream];
    }

    if (this.restartTimer[stream]) {
      delete this.restartTimer[stream];
    }
  }

  stopWebRTCPeer(stream, restarting = false) {
    const isLocal = VideoService.isLocalStream(stream);

    // in this case, 'closed' state is not caused by an error;
    // we stop listening to prevent this from being treated as an error
    const peer = this.webRtcPeers[stream];
    if (peer && peer.peerConnection) {
      const conn = peer.peerConnection;
      conn.oniceconnectionstatechange = null;
    }

    if (isLocal) {
      VideoService.stopVideo(stream);
    }

    const role = VideoService.getRole(isLocal);

    logger.info({
      logCode: 'video_provider_stopping_webcam_sfu',
      extraInfo: { role, cameraId: stream, restarting },
    }, `Camera feed stop requested. Role ${role}, restarting ${restarting}`);

    this.sendMessage({
      id: 'stop',
      type: 'video',
      cameraId: stream,
      role,
    });

    // Clear the shared camera media flow timeout and current reconnect period
    // when destroying it if the peer won't restart
    if (!restarting) {
      this.clearRestartTimers(stream);
    }

    return this.destroyWebRTCPeer(stream);
  }

  destroyWebRTCPeer(stream) {
    let stopped = false;
    const peer = this.webRtcPeers[stream];
    const isLocal = VideoService.isLocalStream(stream);
    const role = VideoService.getRole(isLocal);

    if (peer) {
      if (peer && peer.bbbVideoStream) {
        if (typeof peer.inactivationHandler === 'function') {
          peer.bbbVideoStream.removeListener('inactive', peer.inactivationHandler);
        }
        peer.bbbVideoStream.stop();
      }

      if (typeof peer.dispose === 'function') {
        peer.dispose();
      }

      delete this.webRtcPeers[stream];
      stopped = true;
    } else {
      logger.warn({
        logCode: 'video_provider_destroywebrtcpeer_no_peer',
        extraInfo: { cameraId: stream, role },
      }, 'Trailing camera destroy request.');
    }

    delete this.outboundIceQueues[stream];
    delete this.wsQueues[stream];

    return stopped;
  }

  _createPublisher(stream, peerOptions) {
    return new Promise((resolve, reject) => {
      try {
        const { id: profileId } = VideoService.getCameraProfile();
        let bbbVideoStream = VideoService.getPreloadedStream();

        if (bbbVideoStream) {
          peerOptions.videoStream = bbbVideoStream.mediaStream;
        }

        const peer = new WebRtcPeer('sendonly', peerOptions);
        peer.bbbVideoStream = bbbVideoStream;
        this.webRtcPeers[stream] = peer;
        peer.stream = stream;
        peer.started = false;
        peer.didSDPAnswered = false;
        peer.inboundIceQueue = [];
        peer.isPublisher = true;
        peer.originalProfileId = profileId;
        peer.currentProfileId = profileId;
        peer.vpRestartIceRetries = 0;
        peer.start();
        peer.generateOffer().then((offer) => {
          // Store the media stream if necessary. The scenario here is one where
          // there is no preloaded stream stored.
          if (peer.bbbVideoStream == null) {
            bbbVideoStream = new BBBVideoStream(peer.getLocalStream());
            VideoPreviewService.storeStream(
              MediaStreamUtils.extractDeviceIdFromStream(
                bbbVideoStream.mediaStream,
                'video',
              ),
              bbbVideoStream,
            );
          }

          peer.bbbVideoStream = bbbVideoStream;
          bbbVideoStream.on('streamSwapped', ({ newStream }) => {
            if (newStream && newStream instanceof MediaStream) {
              this.replacePCVideoTracks(stream, newStream);
            }
          });
          peer.inactivationHandler = () => this._handleLocalStreamInactive(stream);
          bbbVideoStream.once('inactive', peer.inactivationHandler);
          resolve(offer);
        }).catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  _createSubscriber(stream, peerOptions) {
    return new Promise((resolve, reject) => {
      try {
        const peer = new WebRtcPeer('recvonly', peerOptions);
        this.webRtcPeers[stream] = peer;
        peer.stream = stream;
        peer.started = false;
        peer.didSDPAnswered = false;
        peer.inboundIceQueue = [];
        peer.isPublisher = false;
        peer.start();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async createWebRTCPeer(stream, isLocal) {
    let iceServers = [];
    const role = VideoService.getRole(isLocal);
    const peerBuilderFunc = isLocal
      ? this._createPublisher.bind(this)
      : this._createSubscriber.bind(this);

    // Check if the peer is already being processed
    if (this.webRtcPeers[stream]) {
      return;
    }

    this.webRtcPeers[stream] = {};
    this.outboundIceQueues[stream] = [];
    const { constraints, bitrate } = VideoService.getCameraProfile();
    const peerOptions = {
      mediaConstraints: {
        audio: false,
        video: constraints,
      },
      onicecandidate: this._getOnIceCandidateCallback(stream, isLocal),
      configuration: {
      },
      trace: TRACE_LOGS,
      networkPriorities: NETWORK_PRIORITY ? { video: NETWORK_PRIORITY } : undefined,
      gatheringTimeout: GATHERING_TIMEOUT,
    };

    try {
      iceServers = await fetchWebRTCMappedStunTurnServers(this.info.sessionToken);
    } catch (error) {
      logger.error({
        logCode: 'video_provider_fetchstunturninfo_error',
        extraInfo: {
          cameraId: stream,
          role,
          errorCode: error.code,
          errorMessage: error.message,
        },
      }, 'video-provider failed to fetch STUN/TURN info, using default');
      // Use fallback STUN server
      iceServers = getMappedFallbackStun();
    } finally {
      // we need to set iceTransportPolicy after `fetchWebRTCMappedStunTurnServers`
      // because `shouldForceRelay` uses the information from the stun API
      peerOptions.configuration.iceTransportPolicy = shouldForceRelay() ? 'relay' : undefined;
      if (iceServers.length > 0) {
        peerOptions.configuration.iceServers = iceServers;
      }

      peerBuilderFunc(stream, peerOptions).then((offer) => {
        if (!this._isMounted) {
          return this.stopWebRTCPeer(stream, false);
        }
        const peer = this.webRtcPeers[stream];

        if (peer && peer.peerConnection) {
          const conn = peer.peerConnection;
          conn.onconnectionstatechange = () => {
            this._handleIceConnectionStateChange(stream, isLocal);
          };
        }

        const message = {
          id: 'start',
          type: 'video',
          cameraId: stream,
          role,
          sdpOffer: offer,
          bitrate,
          record: VideoService.getRecord(),
          mediaServer: VideoService.getMediaServerAdapter(),
        };

        logger.info({
          logCode: 'video_provider_sfu_request_start_camera',
          extraInfo: {
            cameraId: stream,
            role,
          },
        }, `Camera offer generated. Role: ${role}`);

        this.setReconnectionTimeout(stream, isLocal, false);
        this.sendMessage(message);

        return;
      }).catch(error => {
        return this._onWebRTCError(error, stream, isLocal);
      });
    }
  }

  _getWebRTCStartTimeout(stream, isLocal) {
    const { intl } = this.props;

    return () => {
      const role = VideoService.getRole(isLocal);
      if (!isLocal) {
        // Peer that timed out is a subscriber/viewer
        // Subscribers try to reconnect according to their timers if media could
        // not reach the server. That's why we pass the restarting flag as true
        // to the stop procedure as to not destroy the timers
        // Create new reconnect interval time
        const oldReconnectTimer = this.restartTimer[stream];
        const newReconnectTimer = Math.min(
          2 * oldReconnectTimer,
          MAX_CAMERA_SHARE_FAILED_WAIT_TIME,
        );
        this.restartTimer[stream] = newReconnectTimer;

        // Clear the current reconnect interval so it can be re-set in createWebRTCPeer
        if (this.restartTimeout[stream]) {
          delete this.restartTimeout[stream];
        }

        logger.error({
          logCode: 'video_provider_camera_view_timeout',
          extraInfo: {
            cameraId: stream,
            role,
            oldReconnectTimer,
            newReconnectTimer,
          },
        }, 'Camera VIEWER failed. Reconnecting.');

        this.reconnect(stream, isLocal);
      } else {
        // Peer that timed out is a sharer/publisher, clean it up, stop.
        logger.error({
          logCode: 'video_provider_camera_share_timeout',
          extraInfo: {
            cameraId: stream,
            role,
          },
        }, 'Camera SHARER failed.');
        VideoService.notify(intl.formatMessage(intlClientErrors.mediaFlowTimeout));
        this.stopWebRTCPeer(stream, false);
      }
    };
  }

  _onWebRTCError(error, stream, isLocal) {
    const { intl, streams } = this.props;
    const { name: errorName, message: errorMessage } = error;
    const errorLocale = intlClientErrors[errorName]
      || intlClientErrors[errorMessage]
      || intlSFUErrors[error];

    logger.error({
      logCode: 'video_provider_webrtc_peer_error',
      extraInfo: {
        cameraId: stream,
        role: VideoService.getRole(isLocal),
        errorName: error.name,
        errorMessage: error.message,
      },
    }, 'Camera peer failed');

    // Only display WebRTC negotiation error toasts to sharers. The viewer streams
    // will try to autoreconnect silently, but the error will log nonetheless
    if (isLocal) {
      this.stopWebRTCPeer(stream, false);
      if (errorLocale) VideoService.notify(intl.formatMessage(errorLocale));
    } else {
      // If it's a viewer, set the reconnection timeout. There's a good chance
      // no local candidate was generated and it wasn't set.
      const peer = this.webRtcPeers[stream];
      const stillExists = streams.some(({ stream: streamId }) => streamId === stream);

      if (stillExists) {
        const isEstablishedConnection = peer && peer.started;
        this.setReconnectionTimeout(stream, isLocal, isEstablishedConnection);
      }

      // second argument means it will only try to reconnect if
      // it's a viewer instance (see stopWebRTCPeer restarting argument)
      this.stopWebRTCPeer(stream, stillExists);
    }
  }

  reconnect(stream, isLocal) {
    this.stopWebRTCPeer(stream, true);
    this.createWebRTCPeer(stream, isLocal);
  }

  setReconnectionTimeout(stream, isLocal, isEstablishedConnection) {
    const peer = this.webRtcPeers[stream];
    const shouldSetReconnectionTimeout = !this.restartTimeout[stream] && !isEstablishedConnection;

    // This is an ongoing reconnection which succeeded in the first place but
    // then failed mid call. Try to reconnect it right away. Clear the restart
    // timers since we don't need them in this case.
    if (isEstablishedConnection) {
      this.clearRestartTimers(stream);
      return this.reconnect(stream, isLocal);
    }

    // This is a reconnection timer for a peer that hasn't succeeded in the first
    // place. Set reconnection timeouts with random intervals between them to try
    // and reconnect without flooding the server
    if (shouldSetReconnectionTimeout) {
      const newReconnectTimer = this.restartTimer[stream] || CAMERA_SHARE_FAILED_WAIT_TIME;
      this.restartTimer[stream] = newReconnectTimer;

      this.restartTimeout[stream] = setTimeout(
        this._getWebRTCStartTimeout(stream, isLocal),
        this.restartTimer[stream]
      );
    }
  }

  _getOnIceCandidateCallback(stream, isLocal) {
    if (SIGNAL_CANDIDATES) {
      return (candidate) => {
        const peer = this.webRtcPeers[stream];
        const role = VideoService.getRole(isLocal);

        if (peer && !peer.didSDPAnswered) {
          this.outboundIceQueues[stream].push(candidate);
          return;
        }

        this.sendIceCandidateToSFU(peer, role, candidate, stream);
      };
    }

    return null;
  }

  sendIceCandidateToSFU(peer, role, candidate, stream) {
    const message = {
      type: 'video',
      role,
      id: 'onIceCandidate',
      candidate,
      cameraId: stream,
    };
    this.sendMessage(message);
  }

  _handleLocalStreamInactive(stream) {
    const peer = this.webRtcPeers[stream];
    const isLocal = VideoService.isLocalStream(stream);
    const role = VideoService.getRole(isLocal);

    // Peer == null: this is a trailing event.
    // !isLocal: someone is misusing this handler - local streams only.
    if (peer == null || !isLocal) return;

    logger.error({
      logCode: 'video_provider_local_stream_inactive',
      extraInfo: {
        cameraId: stream,
        role,
      },
    }, 'Local camera stream stopped unexpectedly');

    const error = new Error('inactiveError');
    this._onWebRTCError(error, stream, isLocal);
  }

  _handleIceConnectionStateChange(stream, isLocal) {
    const peer = this.webRtcPeers[stream];
    const role = VideoService.getRole(isLocal);

    if (peer && peer.peerConnection) {
      const pc = peer.peerConnection;
      const { connectionState } = pc;
      const handleFatalFailure = () => {
        const error = new Error('iceConnectionStateError');
        // prevent the same error from being detected multiple times
        pc.onconnectionstatechange = null;

        logger.error({
          logCode: 'video_provider_ice_connection_failed_state',
          extraInfo: {
            cameraId: stream,
            connectionState,
            role,
          },
        }, `Camera ICE connection state changed: ${connectionState}. Role: ${role}.`);

        this._onWebRTCError(error, stream, isLocal);
      };

      notifyStreamStateChange(stream, connectionState);

      switch (connectionState) {
        case 'closed':
          handleFatalFailure();
          break;

        case 'failed':
          if (!RESTART_ICE) {
            handleFatalFailure();
          } else {
            try {
              this.requestRestartIce(peer, stream);
            } catch (error) {
              handleFatalFailure();
            }
          }

          break;

        case 'connected':
          if (peer && peer?.vpRestartIceRetries > 0) {
            logger.info({
              logCode: 'video_provider_ice_restarted',
              extraInfo: {
                cameraId: stream,
                role: VideoService.getRole(peer?.isPublisher),
                restartIceRetries: peer?.vpRestartIceRetries,
              },
            }, 'ICE restart successful');
            peer.vpRestartIceRetries = 0;
          }

          break;

        default:
          break;
      }
    } else {
      logger.error({
        logCode: 'video_provider_ice_connection_nopeer',
        extraInfo: { cameraId: stream, role },
      }, `No peer at ICE connection state handler. Camera: ${stream}. Role: ${role}`);
    }
  }

  attach (peer, videoElement) {
    if (peer && videoElement) {
      const stream = peer.isPublisher ? peer.getLocalStream() : peer.getRemoteStream();
      videoElement.pause();
      videoElement.srcObject = stream;
      videoElement.load();
    }
  }

  getVideoElement(streamId) {
    return this.videoTags[streamId];
  }

  attachVideoStream(stream) {
    const videoElement = this.getVideoElement(stream);
    const isLocal = VideoService.isLocalStream(stream);
    const peer = this.webRtcPeers[stream];

    if (VideoProvider.shouldAttachVideoStream(peer, videoElement)) {
      const pc = peer.peerConnection;
      // Notify current stream state again on attachment since the
      // video-list-item component may not have been mounted before the stream
      // reached the connected state.
      // This is necessary to ensure that the video element is properly
      // hidden/shown when the stream is attached.
      notifyStreamStateChange(stream, pc.connectionState);
      this.attach(peer, videoElement);

      if (isLocal) {
        if (peer.bbbVideoStream == null) {
          this.handleVirtualBgError(new TypeError('Undefined media stream'));
          return;
        }

        const deviceId = MediaStreamUtils.extractDeviceIdFromStream(
          peer.bbbVideoStream.mediaStream,
          'video',
        );
        const { type, name } = getSessionVirtualBackgroundInfoWithDefault(deviceId);

        this.restoreVirtualBackground(peer.bbbVideoStream, type, name).catch((error) => {
          this.handleVirtualBgError(error, type, name);
        });
      }
    }
  }

  startVirtualBackgroundByDrop(stream, type, name, data) {
    return new Promise((resolve, reject) => {
      const peer = this.webRtcPeers[stream];
      const { bbbVideoStream } = peer;
      const video = this.getVideoElement(stream);

      if (peer && video && video.srcObject) {
        bbbVideoStream.startVirtualBackground(type, name, { file: data })
          .then(resolve)
          .catch(reject);
      }
    }).catch((error) => {
      this.handleVirtualBgErrorByDropping(error, type, name);
    });
  }

  handleVirtualBgErrorByDropping(error, type, name) {
    logger.error({
      logCode: `video_provider_virtualbg_error`,
      extraInfo: {
        errorName: error.name,
        errorMessage: error.message,
        virtualBgType: type,
        virtualBgName: name,
      },
    }, `Failed to start virtual background by dropping image: ${error.message}`);
  }

  restoreVirtualBackground(stream, type, name) {
    return new Promise((resolve, reject) => {
      if (type !== EFFECT_TYPES.NONE_TYPE) {
        stream.startVirtualBackground(type, name).then(() => {
          resolve();
        }).catch((error) => {
          reject(error);
        });
      }
      resolve();
    });
  }

  handleVirtualBgError(error, type, name) {
    const { intl } = this.props;
    logger.error({
      logCode: `video_provider_virtualbg_error`,
      extraInfo: {
        errorName: error.name,
        errorMessage: error.message,
        virtualBgType: type,
        virtualBgName: name,
      },
    }, `Failed to restore virtual background after reentering the room: ${error.message}`);

    notify(intl.formatMessage(intlClientErrors.virtualBgGenericError), 'error', 'video');
  }

  createVideoTag(stream, video) {
    const peer = this.webRtcPeers[stream];
    this.videoTags[stream] = video;

    if (peer && peer.stream === stream) {
      this.attachVideoStream(stream);
    }
  }

  destroyVideoTag(stream) {
    const videoElement = this.videoTags[stream];

    if (videoElement == null) return;

    if (typeof videoElement.pause === 'function') {
      videoElement.pause();
      videoElement.srcObject = null;
    }

    delete this.videoTags[stream];
  }

  handlePlayStop(message) {
    const { intl } = this.props;
    const { cameraId: stream, role } = message;

    logger.info({
      logCode: 'video_provider_handle_play_stop',
      extraInfo: {
        cameraId: stream,
        role,
      },
    }, `Received request from SFU to stop camera. Role: ${role}`);

    VideoService.notify(intl.formatMessage(intlClientErrors.mediaTimedOutError));
    this.stopWebRTCPeer(stream, false);
  }

  handlePlayStart(message) {
    const { cameraId: stream, role } = message;
    const peer = this.webRtcPeers[stream];

    if (peer) {
      logger.info({
        logCode: 'video_provider_handle_play_start_flowing',
        extraInfo: {
          cameraId: stream,
          role,
        },
      }, `Camera media is flowing (server). Role: ${role}`);

      peer.started = true;

      // Clear camera shared timeout when camera succesfully starts
      this.clearRestartTimers(stream);
      this.attachVideoStream(stream);

      VideoService.playStart(stream);
    } else {
      logger.warn({
        logCode: 'video_provider_playstart_no_peer',
        extraInfo: { cameraId: stream, role },
      }, 'Trailing camera playStart response.');
    }
  }

  handleSFUError(message) {
    const { intl, streams } = this.props;
    const { code, reason, streamId } = message;
    const isLocal = VideoService.isLocalStream(streamId);
    const role = VideoService.getRole(isLocal);

    logger.error({
      logCode: 'video_provider_handle_sfu_error',
      extraInfo: {
        errorCode: code,
        errorReason: reason,
        cameraId: streamId,
        role,
      },
    }, `SFU returned an error. Code: ${code}, reason: ${reason}`);

    if (isLocal) {
      // The publisher instance received an error from the server. There's no reconnect,
      // stop it.
      VideoService.notify(intl.formatMessage(intlSFUErrors[code] || intlSFUErrors[2200]));
      VideoService.stopVideo(streamId);
    } else {
      const peer = this.webRtcPeers[streamId];
      const stillExists = streams.some(({ stream }) => streamId === stream);

      if (stillExists) {
        const isEstablishedConnection = peer && peer.started;
        this.setReconnectionTimeout(streamId, isLocal, isEstablishedConnection);
      }

      this.stopWebRTCPeer(streamId, stillExists);
    }
  }

  replacePCVideoTracks(streamId, mediaStream) {
    const peer = this.webRtcPeers[streamId];
    const videoElement = this.getVideoElement(streamId);

    if (peer == null || mediaStream == null || videoElement == null) return;

    const pc = peer.peerConnection;
    const newTracks = mediaStream.getVideoTracks();

    if (pc) {
      const trackReplacers = pc.getSenders().map(async (sender, index) => {
        if (sender.track == null || sender.track.kind !== 'video') return false;
        const newTrack = newTracks[index];
        if (newTrack == null) return false;
        try {
          await sender.replaceTrack(newTrack);
          return true;
        } catch (error) {
          logger.warn({
            logCode: 'video_provider_replacepc_error',
            extraInfo: { errorMessage: error.message, cameraId: streamId },
          }, `Failed to replace peer connection tracks: ${error.message}`);
          return false;
        }
      });
      Promise.all(trackReplacers).then(() => {
        this.attach(peer, videoElement);
      });
    }
  }

  render() {
    const {
      swapLayout,
      currentVideoPageIndex,
      streams,
      cameraDockBounds,
      focusedId,
      handleVideoFocus,
      isGridEnabled,
    } = this.props;

    return (
      <VideoListContainer
        {...{
          streams,
          swapLayout,
          currentVideoPageIndex,
          cameraDockBounds,
          focusedId,
          handleVideoFocus,
          isGridEnabled,
        }}
        onVideoItemMount={this.createVideoTag}
        onVideoItemUnmount={this.destroyVideoTag}
        onVirtualBgDrop={this.startVirtualBackgroundByDrop}
      />
    );
  }
}

VideoProvider.propTypes = propTypes;

export default injectIntl(VideoProvider);

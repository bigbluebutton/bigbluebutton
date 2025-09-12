// @ts-nocheck
import React, { Component } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { IntlShape, defineMessages, injectIntl } from 'react-intl';
import { debounce } from '/imports/utils/debounce';
import VideoService from './service';
import VideoListContainer from './video-list/container';
import {
  fetchWebRTCMappedStunTurnServers,
  getMappedFallbackStun,
} from '/imports/utils/fetchStunTurnServers';
import logger from '/imports/startup/client/logger';
import { notifyStreamStateChange } from '/imports/ui/services/bbb-webrtc-sfu/stream-state-service';
import VideoPreviewService from '/imports/ui/components/video-preview/service';
import MediaStreamUtils from '/imports/utils/media-stream-utils';
import BBBVideoStream from '/imports/ui/services/webrtc-base/bbb-video-stream';
import { shouldForceRelay } from '/imports/ui/services/bbb-webrtc-sfu/utils';
import WebRtcPeer from '/imports/ui/services/webrtc-base/peer';
import { VideoItem } from './types';
import { Output } from '/imports/ui/components/layout/layoutTypes';
import { VIDEO_TYPES } from './enums';

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

interface VideoProviderState {
  socketOpen: boolean;
}

interface VideoProviderProps {
  cameraDock: Output['cameraDock'];
  focusedId: string;
  handleVideoFocus: (id: string) => void;
  isGridEnabled: boolean;
  isClientConnected: boolean;
  totalNumberOfStreams: number;
  isUserLocked: boolean;
  currentVideoPageIndex: number;
  streams: VideoItem[];
  info: {
    userId: string | null | undefined;
    userName: string | null | undefined;
    meetingId: string | null | undefined;
    sessionToken: string | null;
    voiceBridge: string | null;
  };
  playStart: (cameraId: string) => void;
  exitVideo: () => void;
  lockUser: () => void;
  stopVideo: (cameraId?: string) => void;
  applyCameraProfile: (peer: WebRtcPeer, profileId: string) => void;
  intl: IntlShape;
}

class VideoProvider extends Component<VideoProviderProps, VideoProviderState> {
  onBeforeUnload() {
    const { exitVideo } = this.props;
    exitVideo();
  }

  static shouldAttachVideoStream(peer: WebRtcPeer, videoElement: HTMLVideoElement) {
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

  private info: {
    userId: string | null | undefined;
    userName: string | null | undefined;
    meetingId: string | null | undefined;
    sessionToken: string | null;
    voiceBridge: string | null;
  };

  private mounted: boolean = false;

  private webRtcPeers: Record<string, WebRtcPeer>;

  private debouncedConnectStreams: (streamsToConnect: string[]) => void;

  private ws: ReconnectingWebSocket | null = null;

  private wsQueues: Record<string, {
    id: string;
    cameraId?: string;
    type?: string;
    role?: string;
  }[] | null>;

  private outboundIceQueues: Record<string, RTCIceCandidate[]>;

  private restartTimeout: Record<string, NodeJS.Timeout>;

  private restartTimer: Record<string, number>;

  private videoTags: Record<string, HTMLVideoElement>;

  constructor(props: VideoProviderProps) {
    super(props);
    const { info } = this.props;

    // socketOpen state is there to force update when the signaling socket opens or closes
    this.state = {
      socketOpen: false,
    };
    this.mounted = false;
    this.info = info;
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
    this.onBeforeUnload = this.onBeforeUnload.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    VideoService.updatePeerDictionaryReference(this.webRtcPeers);
    this.ws = this.openWs();
    window.addEventListener('beforeunload', this.onBeforeUnload);
  }

  componentDidUpdate(prevProps: VideoProviderProps) {
    const {
      isUserLocked,
      streams,
      currentVideoPageIndex,
      isClientConnected,
      lockUser,
    } = this.props;
    const { socketOpen } = this.state;

    // Only debounce when page changes to avoid unnecessary debouncing
    const shouldDebounce = VideoService.isPaginationEnabled()
      && prevProps.currentVideoPageIndex !== currentVideoPageIndex;

    if (isClientConnected && socketOpen) this.updateStreams(streams, shouldDebounce);
    if (!prevProps.isUserLocked && isUserLocked) {
      lockUser();
    }

    // Signaling socket expired its retries and meteor is connected - create
    // a new signaling socket instance from scratch
    if (!socketOpen
      && isClientConnected
      && this.ws == null) {
      this.ws = this.openWs();
    }
  }

  componentWillUnmount() {
    const { exitVideo } = this.props;
    this.mounted = false;
    VideoService.updatePeerDictionaryReference({});

    if (this.ws) {
      this.ws.onmessage = null;
      this.ws.onopen = null;
      this.ws.onclose = null;
    }

    window.removeEventListener('beforeunload', this.onBeforeUnload);
    exitVideo();
    Object.keys(this.webRtcPeers).forEach((stream) => {
      this.stopWebRTCPeer(stream, false);
    });
    this.terminateWs();
  }

  openWs() {
    const {
      connectionTimeout: WS_CONN_TIMEOUT = 4000,
      maxRetries: WS_MAX_RETRIES = 5,
      debug: WS_DEBUG,
    } = window.meetingClientSettings.public.kurento.cameraWsOptions;

    const ws = new ReconnectingWebSocket(
      VideoService.getAuthenticatedURL(), [], {
        connectionTimeout: WS_CONN_TIMEOUT,
        debug: WS_DEBUG,
        maxRetries: WS_MAX_RETRIES,
        maxEnqueuedMessages: 0,
      },
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

  private updateLastMsgTime() {
    if (this.ws) {
      this.ws.isAlive = true;
      this.ws.lastMsgTime = Date.now();
    }
  }

  private getTimeSinceLastMsg() {
    return Date.now() - this.ws.lastMsgTime;
  }

  setupWSHeartbeat() {
    const {
      heartbeat: WS_HEARTBEAT_OPTS = {
        interval: 15000,
        delay: 3000,
        reconnectOnFailure: true,
      },
    } = window.meetingClientSettings.public.kurento.cameraWsOptions;

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

      if (this.getTimeSinceLastMsg() < (
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

  onWsMessage(message: { data: string }) {
    this.updateLastMsgTime();
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
    const {
      maxRetries: WS_MAX_RETRIES = 5,
    } = window.meetingClientSettings.public.kurento.cameraWsOptions;

    const { exitVideo } = this.props;
    logger.info({
      logCode: 'video_provider_onwsclose',
    }, 'Multiple video provider websocket connection closed.');

    this.clearWSHeartbeat();
    exitVideo();
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

    this.updateLastMsgTime();
    this.setupWSHeartbeat();
    this.setState({ socketOpen: true });
    // Resend queued messages that happened when socket was not connected
    Object.entries(this.wsQueues).forEach(([stream, queue]) => {
      if (this.webRtcPeers[stream] && queue !== null) {
        // Peer - send enqueued
        while (queue.length > 0) {
          this.sendMessage(queue.pop()!);
        }
      } else {
        // No peer - delete queue
        this.wsQueues[stream] = null;
      }
    });
  }

  findAllPrivilegedStreams() {
    const { streams } = this.props;
    // Privileged streams are: floor holders, pinned users
    return streams.filter((stream) => stream.type === VIDEO_TYPES.STREAM && (stream.floor || stream.pinned));
  }

  updateQualityThresholds(numberOfPublishers: number) {
    const {
      privilegedStreams: CAMERA_QUALITY_THR_PRIVILEGED = true,
    } = window.meetingClientSettings.public.kurento.cameraQualityThresholds;

    const { applyCameraProfile } = this.props;
    const { threshold, profile } = VideoService.getThreshold(numberOfPublishers);

    if (profile) {
      const privilegedStreams = this.findAllPrivilegedStreams();
      Object.values(this.webRtcPeers)
        .filter((peer) => peer.isPublisher)
        .forEach((peer) => {
          // Conditions which make camera revert their original profile
          // 1) Threshold 0 means original profile/inactive constraint
          // 2) Privileged streams
          const exempt = threshold === 0
            || (CAMERA_QUALITY_THR_PRIVILEGED && privilegedStreams.some((vs) => vs.stream === peer.stream));
          const profileToApply = exempt ? peer.originalProfileId : profile;
          applyCameraProfile(peer, profileToApply);
        });
    }
  }

  connectStreams(streamsToConnect: string[]) {
    streamsToConnect.forEach((stream) => {
      const isLocal = VideoService.isLocalStream(stream);
      this.createWebRTCPeer(stream, isLocal);
    });
  }

  disconnectStreams(streamsToDisconnect: string[]) {
    streamsToDisconnect.forEach((stream) => this.stopWebRTCPeer(stream, false));
  }

  updateStreams(streams: VideoItem[], shouldDebounce = false) {
    const connectedStreamIds = Object.keys(this.webRtcPeers);
    const [
      streamsToConnect,
      streamsToDisconnect,
    ] = VideoService.getStreamsToConnectAndDisconnect(streams, connectedStreamIds);

    if (shouldDebounce) {
      this.debouncedConnectStreams(streamsToConnect);
    } else {
      this.connectStreams(streamsToConnect);
    }

    this.disconnectStreams(streamsToDisconnect);

    const {
      enabled: CAMERA_QUALITY_THRESHOLDS_ENABLED = true,
    } = window.meetingClientSettings.public.kurento.cameraQualityThresholds;

    if (CAMERA_QUALITY_THRESHOLDS_ENABLED) {
      const { totalNumberOfStreams } = this.props;
      this.updateQualityThresholds(totalNumberOfStreams);
    }
  }

  ping() {
    const message = { id: 'ping' };
    this.sendMessage(message);
  }

  sendMessage(message: { id: string, cameraId?: string; type?: string; role?: string }) {
    const { ws } = this;

    if (this.connectedToMediaServer()) {
      const jsonMessage = JSON.stringify(message);
      try {
        ws?.send(jsonMessage);
      } catch (error: Error) {
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
        this.wsQueues[cameraId]?.push(message);
      }
    }
  }

  connectedToMediaServer() {
    return this.ws && this.ws.readyState === ReconnectingWebSocket.OPEN;
  }

  processOutboundIceQueue(peer: WebRtcPeer, role: string, stream: string) {
    const queue = this.outboundIceQueues[stream];
    while (queue && queue.length) {
      const candidate = queue.shift();
      this.sendIceCandidateToSFU(peer, role, candidate, stream);
    }
  }

  sendLocalAnswer(peer: WebRtcPeer, stream: string, answer) {
    const message = {
      id: 'subscriberAnswer',
      type: 'video',
      role: VideoService.getRole(peer.isPublisher),
      cameraId: stream,
      answer,
    };

    this.sendMessage(message);
  }

  requestRestartIce(peer: WebRtcPeer, stream: string) {
    const {
      retries: RESTART_ICE_RETRIES = 3,
    } = window.meetingClientSettings.public.kurento?.restartIce?.video || {};

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

  startResponse(message: { cameraId: string; stream: string; role: string }) {
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
      }).catch((error: Error & { code: string }) => {
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

  handleIceCandidate(message: { cameraId: string; candidate: Record<string, unknown> }) {
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

  handleRestartIceResponse(message: { cameraId: string; sdp: string }) {
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
          this.onWebRTCError(
            new Error('iceConnectionStateError'),
            stream,
            VideoService.isLocalStream(stream),
          );
        });
    }
  }

  clearRestartTimers(stream: string) {
    if (this.restartTimeout[stream]) {
      clearTimeout(this.restartTimeout[stream]);
      delete this.restartTimeout[stream];
    }

    if (this.restartTimer[stream]) {
      delete this.restartTimer[stream];
    }
  }

  stopWebRTCPeer(stream: string, restarting = false) {
    const isLocal = VideoService.isLocalStream(stream);
    const { stopVideo } = this.props;

    // in this case, 'closed' state is not caused by an error;
    // we stop listening to prevent this from being treated as an error
    const peer = this.webRtcPeers[stream];
    if (peer && peer.peerConnection) {
      const conn = peer.peerConnection;
      conn.oniceconnectionstatechange = null;
    }

    if (isLocal) {
      stopVideo(stream);
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

  destroyWebRTCPeer(stream: string) {
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

  private createPublisher(stream: string, peerOptions: Record<string, unknown>) {
    return new Promise((resolve, reject) => {
      try {
        const { id: profileId } = VideoService.getCameraProfile();
        let bbbVideoStream = VideoService.getPreloadedStream();

        if (bbbVideoStream) {
          // eslint-disable-next-line no-param-reassign
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
          peer.inactivationHandler = () => this.handleLocalStreamInactive(stream);
          bbbVideoStream.once('inactive', peer.inactivationHandler);
          resolve(offer);
        }).catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  private createSubscriber(stream: string, peerOptions: Record<string, unknown>) {
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
        resolve(null);
      } catch (error) {
        reject(error);
      }
    });
  }

  async createWebRTCPeer(stream: string, isLocal: boolean) {
    let iceServers = [];
    const role = VideoService.getRole(isLocal);
    const peerBuilderFunc = isLocal
      ? this.createPublisher.bind(this)
      : this.createSubscriber.bind(this);

    // Check if the peer is already being processed
    if (this.webRtcPeers[stream]) {
      return;
    }

    const { webcam: NETWORK_PRIORITY } = window.meetingClientSettings.public.media.networkPriorities || {};
    const TRACE_LOGS = window.meetingClientSettings.public.kurento.traceLogs;
    const GATHERING_TIMEOUT = window.meetingClientSettings.public.kurento.gatheringTimeout;

    this.webRtcPeers[stream] = {};
    this.outboundIceQueues[stream] = [];
    const { constraints, bitrate } = VideoService.getCameraProfile();
    const peerOptions = {
      mediaConstraints: {
        audio: false,
        video: constraints,
      },
      onicecandidate: this.getOnIceCandidateCallback(stream, isLocal),
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
        if (!this.mounted) {
          return this.stopWebRTCPeer(stream, false);
        }
        const peer = this.webRtcPeers[stream];

        if (peer && peer.peerConnection) {
          const conn = peer.peerConnection;
          conn.onconnectionstatechange = () => {
            this.handleIceConnectionStateChange(stream, isLocal);
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

        return null;
      }).catch((error) => {
        return this.onWebRTCError(error, stream, isLocal);
      });
    }
  }

  private getWebRTCStartTimeout(stream: string, isLocal: boolean) {
    const { intl } = this.props;

    const {
      maxTimeout: MAX_CAMERA_SHARE_FAILED_WAIT_TIME = 60000,
    } = window.meetingClientSettings.public.kurento.cameraTimeouts || {};

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

  private onWebRTCError(error: Error, stream: string, isLocal: boolean) {
    const { intl, streams } = this.props;
    const { name: errorName, message: errorMessage } = error;
    const errorLocale = intlClientErrors[errorName as keyof typeof intlClientErrors]
      || intlClientErrors[errorMessage as keyof typeof intlClientErrors]
      || intlSFUErrors[error as unknown as keyof typeof intlSFUErrors];

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
      const stillExists = streams.some((item) => item.type === VIDEO_TYPES.STREAM && item.stream === stream);

      if (stillExists) {
        const isEstablishedConnection = peer && peer.started;
        this.setReconnectionTimeout(stream, isLocal, isEstablishedConnection);
      }

      // second argument means it will only try to reconnect if
      // it's a viewer instance (see stopWebRTCPeer restarting argument)
      this.stopWebRTCPeer(stream, stillExists);
    }
  }

  reconnect(stream: string, isLocal: boolean) {
    this.stopWebRTCPeer(stream, true);
    this.createWebRTCPeer(stream, isLocal);
  }

  setReconnectionTimeout(stream: string, isLocal: boolean, isEstablishedConnection: boolean) {
    const shouldSetReconnectionTimeout = !this.restartTimeout[stream] && !isEstablishedConnection;

    const {
      baseTimeout: CAMERA_SHARE_FAILED_WAIT_TIME = 15000,
    } = window.meetingClientSettings.public.kurento.cameraTimeouts || {};

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
        this.getWebRTCStartTimeout(stream, isLocal),
        this.restartTimer[stream],
      );
    }
    return null;
  }

  private getOnIceCandidateCallback(stream: string, isLocal: boolean) {
    const SIGNAL_CANDIDATES = window.meetingClientSettings.public.kurento.signalCandidates;

    if (SIGNAL_CANDIDATES) {
      return (candidate: RTCIceCandidate) => {
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

  sendIceCandidateToSFU(peer: WebRtcPeer, role: string, candidate: RTCIceCandidate | undefined, stream: string) {
    const message = {
      type: 'video',
      role,
      id: 'onIceCandidate',
      candidate,
      cameraId: stream,
    };
    this.sendMessage(message);
  }

  private handleLocalStreamInactive(stream: string) {
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
    this.onWebRTCError(error, stream, isLocal);
  }

  private handleIceConnectionStateChange(stream: string, isLocal: boolean) {
    const peer = this.webRtcPeers[stream];
    const role = VideoService.getRole(isLocal);
    const {
      enabled: RESTART_ICE = false,
    } = window.meetingClientSettings.public.kurento?.restartIce?.video || {};

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

        this.onWebRTCError(error, stream, isLocal);
      };

      notifyStreamStateChange(stream, connectionState);

      switch (connectionState) {
        case 'closed':
          handleFatalFailure();
          break;

        case 'failed':
          // ICE restart only works for publishers right now - recvonly full
          // reconnection works ok without it.
          if (!RESTART_ICE || !peer?.isPublisher) {
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

  static attach(peer: WebRtcPeer, videoElement: HTMLVideoElement) {
    if (peer && videoElement) {
      const stream = peer.isPublisher ? peer.getLocalStream() : peer.getRemoteStream();
      videoElement.pause();
      // eslint-disable-next-line no-param-reassign
      videoElement.srcObject = stream;
      videoElement.load();
    }
  }

  getVideoElement(streamId: string) {
    return this.videoTags[streamId];
  }

  attachVideoStream(stream: string) {
    const videoElement = this.getVideoElement(stream);
    const peer = this.webRtcPeers[stream];

    if (VideoProvider.shouldAttachVideoStream(peer, videoElement)) {
      const pc = peer.peerConnection;
      // Notify current stream state again on attachment since the
      // video-list-item component may not have been mounted before the stream
      // reached the connected state.
      // This is necessary to ensure that the video element is properly
      // hidden/shown when the stream is attached.
      notifyStreamStateChange(stream, pc.connectionState);
      VideoProvider.attach(peer, videoElement);
    }
  }

  async startVirtualBackgroundByDrop(stream: string, type: string, name: string, data: string) {
    try {
      const peer = this.webRtcPeers[stream];
      const { bbbVideoStream } = peer;
      await VideoService.startVirtualBackground(bbbVideoStream, type, name, data);
    } catch (error) {
      const { intl } = this.props;
      const errorLocale = intlClientErrors.virtualBgGenericError;

      if (errorLocale) VideoService.notify(intl.formatMessage(errorLocale));
    }
  }

  createVideoTag(stream: string, video: HTMLVideoElement) {
    const peer = this.webRtcPeers[stream];
    this.videoTags[stream] = video;

    if (peer && peer.stream === stream) {
      this.attachVideoStream(stream);
    }
  }

  destroyVideoTag(stream: string) {
    const videoElement = this.videoTags[stream];

    if (videoElement == null) return;

    if (typeof videoElement.pause === 'function') {
      videoElement.pause();
      videoElement.srcObject = null;
    }

    delete this.videoTags[stream];
  }

  handlePlayStop(message: { cameraId: string; role: string }) {
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

  handlePlayStart(message: { cameraId: string; role: string }) {
    const { cameraId: stream, role } = message;
    const peer = this.webRtcPeers[stream];
    const { playStart } = this.props;

    if (peer) {
      logger.info({
        logCode: 'video_provider_handle_play_start_flowing',
        extraInfo: {
          cameraId: stream,
          role,
        },
      }, `Camera media is flowing (server). Role: ${role}`);

      peer.started = true;

      // Clear camera shared timeout when camera successfully starts
      this.clearRestartTimers(stream);
      this.attachVideoStream(stream);

      playStart(stream);
    } else {
      logger.warn({
        logCode: 'video_provider_playstart_no_peer',
        extraInfo: { cameraId: stream, role },
      }, 'Trailing camera playStart response.');
    }
  }

  handleSFUError(message: { code: string; reason: string; streamId: string }) {
    const { intl, streams, stopVideo } = this.props;
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
      VideoService.notify(
        intl.formatMessage(intlSFUErrors[code as unknown as keyof typeof intlSFUErrors]
        || intlSFUErrors[2200]),
      );
      stopVideo(streamId);
    } else {
      const peer = this.webRtcPeers[streamId];
      const stillExists = streams.some((item) => item.type === VIDEO_TYPES.STREAM && streamId === item.stream);

      if (stillExists) {
        const isEstablishedConnection = peer && peer.started;
        this.setReconnectionTimeout(streamId, isLocal, isEstablishedConnection);
      }

      this.stopWebRTCPeer(streamId, stillExists);
    }
  }

  replacePCVideoTracks(streamId: string, mediaStream: MediaStream) {
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
        VideoProvider.attach(peer, videoElement);
      });
    }
  }

  render() {
    const {
      currentVideoPageIndex,
      streams,
      cameraDock,
      focusedId,
      handleVideoFocus,
      isGridEnabled,
    } = this.props;

    return (
      <VideoListContainer
        {...{
          streams,
          currentVideoPageIndex,
          cameraDock,
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

export default injectIntl(VideoProvider);

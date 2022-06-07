import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
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
import { BBBVideoStream } from '/imports/ui/services/webrtc-base/bbb-video-stream';
import {
  EFFECT_TYPES,
  getSessionVirtualBackgroundInfo,
} from '/imports/ui/services/virtual-background/service';
import { notify } from '/imports/ui/services/notification';
import { shouldForceRelay } from '/imports/ui/services/bbb-webrtc-sfu/utils';

// Default values and default empty object to be backwards compat with 2.2.
// FIXME Remove hardcoded defaults 2.3.
const WS_CONN_TIMEOUT = Meteor.settings.public.kurento.wsConnectionTimeout || 4000;

const {
  baseTimeout: CAMERA_SHARE_FAILED_WAIT_TIME = 15000,
  maxTimeout: MAX_CAMERA_SHARE_FAILED_WAIT_TIME = 60000,
} = Meteor.settings.public.kurento.cameraTimeouts || {};
const CAMERA_QUALITY_THRESHOLDS_ENABLED = Meteor.settings.public.kurento.cameraQualityThresholds.enabled;
const PING_INTERVAL = 15000;
const SIGNAL_CANDIDATES = Meteor.settings.public.kurento.signalCandidates;

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
};

class VideoProvider extends Component {
  static onBeforeUnload() {
    VideoService.onBeforeUnload();
  }

  constructor(props) {
    super(props);

    // socketOpen state is there to force update when the signaling socket opens or closes
    this.state = {
      socketOpen: false,
    };
    this._isMounted = false;

    this.info = VideoService.getInfo();

    // Set a valid bbb-webrtc-sfu application server socket in the settings
    this.ws = new ReconnectingWebSocket(
      VideoService.getAuthenticatedURL(),
      [],
      { connectionTimeout: WS_CONN_TIMEOUT },
    );
    this.wsQueue = [];
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
    this.debouncedConnectStreams = _.debounce(
      this.connectStreams,
      VideoService.getPageChangeDebounceTime(),
      { leading: false, trailing: true },
    );
  }

  componentDidMount() {
    this._isMounted = true;
    VideoService.updatePeerDictionaryReference(this.webRtcPeers);

    this.ws.onopen = this.onWsOpen;
    this.ws.onclose = this.onWsClose;
    window.addEventListener('online', this.openWs);
    window.addEventListener('offline', this.onWsClose);

    this.ws.onmessage = this.onWsMessage;

    window.addEventListener('beforeunload', VideoProvider.onBeforeUnload);
  }

  componentDidUpdate(prevProps) {
    const { isUserLocked, streams, currentVideoPageIndex } = this.props;

    // Only debounce when page changes to avoid unecessary debouncing
    const shouldDebounce = VideoService.isPaginationEnabled()
      && prevProps.currentVideoPageIndex !== currentVideoPageIndex;

    this.updateStreams(streams, shouldDebounce);

    if (!prevProps.isUserLocked && isUserLocked) VideoService.lockUser();
  }

  componentWillUnmount() {
    VideoService.updatePeerDictionaryReference({});

    this.ws.onmessage = null;
    this.ws.onopen = null;
    this.ws.onclose = null;

    window.removeEventListener('online', this.openWs);
    window.removeEventListener('offline', this.onWsClose);

    window.removeEventListener('beforeunload', VideoProvider.onBeforeUnload);

    VideoService.exitVideo();

    Object.keys(this.webRtcPeers).forEach((stream) => {
      this.stopWebRTCPeer(stream, false);
    });

    // Close websocket connection to prevent multiple reconnects from happening
    this.ws.close();
    this._isMounted = false;
  }

  onWsMessage(message) {
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

    clearInterval(this.pingInterval);

    VideoService.exitVideo();

    this.setState({ socketOpen: false });
  }

  onWsOpen() {
    logger.info({
      logCode: 'video_provider_onwsopen',
    }, 'Multiple video provider websocket connection opened.');

    // Resend queued messages that happened when socket was not connected
    while (this.wsQueue.length > 0) {
      this.sendMessage(this.wsQueue.pop());
    }

    this.pingInterval = setInterval(this.ping.bind(this), PING_INTERVAL);

    this.setState({ socketOpen: true });
  }

  findAllPrivilegedStreams () {
    const { streams } = this.props;
    // Privileged streams are: floor holders
    return streams.filter(stream => stream.floor || stream.pin);
  }

  updateQualityThresholds(numberOfPublishers) {
    const { threshold, profile } = VideoService.getThreshold(numberOfPublishers);
    if (profile) {
      const privilegedStreams = this.findAllPrivilegedStreams();
      Object.values(this.webRtcPeers)
        .filter(peer => peer.isPublisher)
        .forEach((peer) => {
          // 1) Threshold 0 means original profile/inactive constraint
          // 2) Privileged streams are: floor holders
          const exempt = threshold === 0 || privilegedStreams.some(vs => vs.stream === peer.stream)
          const profileToApply = exempt ? peer.originalProfileId : profile;
          VideoService.applyCameraProfile(peer, profileToApply);
        });
    }
  }

  getStreamsToConnectAndDisconnect(streams) {
    const streamsCameraIds = streams.map(s => s.stream);
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
      ws.send(jsonMessage, (error) => {
        if (error) {
          logger.error({
            logCode: 'video_provider_ws_send_error',
            extraInfo: {
              errorMessage: error.message || 'Unknown',
              errorCode: error.code,
            },
          }, 'Camera request failed to be sent to SFU');
        }
      });
    } else if (message.id !== 'stop') {
      // No need to queue video stop messages
      this.wsQueue.push(message);
    }
  }

  connectedToMediaServer() {
    return this.ws.readyState === WebSocket.OPEN;
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

      processorFunc(message.sdpAnswer, (error, answer) => {
        if (error) {
          logger.error({
            logCode: 'video_provider_peerconnection_process_error',
            extraInfo: {
              cameraId: stream,
              role,
              errorMessage: error.message,
              errorCode: error.code,
            },
          }, 'Camera answer processing failed');

          return;
        }

        if (answer) this.sendLocalAnswer(peer, stream, answer);

        peer.didSDPAnswered = true;
        this.processOutboundIceQueue(peer, role, stream);
        VideoService.processInboundIceQueue(peer, stream);
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

    this.destroyWebRTCPeer(stream);
  }

  destroyWebRTCPeer(stream) {
    const peer = this.webRtcPeers[stream];
    const isLocal = VideoService.isLocalStream(stream);
    const role = VideoService.getRole(isLocal);

    if (peer) {
      if (peer && peer.bbbVideoStream) {
        peer.bbbVideoStream.stop();
      }

      if (typeof peer.dispose === 'function') {
        peer.dispose();
      }

      delete this.outboundIceQueues[stream];
      delete this.webRtcPeers[stream];
    } else {
      logger.warn({
        logCode: 'video_provider_destroywebrtcpeer_no_peer',
        extraInfo: { cameraId: stream, role },
      }, 'Trailing camera destroy request.');
    }
  }

  _createPublisher (stream, peerOptions) {
    return new Promise((resolve, reject) => {
      try {
        const { id: profileId } = VideoService.getCameraProfile();
        let bbbVideoStream = VideoService.getPreloadedStream();

        if (bbbVideoStream) {
          peerOptions.videoStream = bbbVideoStream.mediaStream;
        }

        const handlePubPeerCreation = (error) => {
          const peer = this.webRtcPeers[stream];
          peer.stream = stream;
          peer.started = false;
          peer.attached = false;
          peer.didSDPAnswered = false;
          peer.inboundIceQueue = [];
          peer.isPublisher = true;
          peer.originalProfileId = profileId;
          peer.currentProfileId = profileId;

          if (error) return reject(error);

          // Store the media stream if necessary. The scenario here is one where
          // there is no preloaded stream stored.
          if (bbbVideoStream == null) {
            bbbVideoStream = new BBBVideoStream(peer.getLocalStream());
            VideoPreviewService.storeStream(
              MediaStreamUtils.extractVideoDeviceId(bbbVideoStream.mediaStream),
              bbbVideoStream
            );
          }

          peer.bbbVideoStream = bbbVideoStream;
          bbbVideoStream.on('streamSwapped', ({ newStream }) => {
            if (newStream && newStream instanceof MediaStream) {
              this.replacePCVideoTracks(stream, newStream);
            }
          });

          peer.generateOffer((errorGenOffer, offerSdp) => {
            if (errorGenOffer) {
              return reject(errorGenOffer);
            }

            return resolve(offerSdp);
          });
        }

        this.webRtcPeers[stream] = new window.kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(
          peerOptions,
          handlePubPeerCreation,
        );
      } catch (error) {
        return reject(error);
      }
    });
  }

  _createSubscriber (stream, peerOptions) {
    return new Promise((resolve, reject) => {
      try {
        const handleSubPeerCreation = (error) => {
          const peer = this.webRtcPeers[stream];
          peer.stream = stream;
          peer.started = false;
          peer.attached = false;
          peer.didSDPAnswered = false;
          peer.inboundIceQueue = [];
          peer.isPublisher = false;

          if (error) return reject(error);

          return resolve();
        };

        this.webRtcPeers[stream] = new window.kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(
          peerOptions,
          handleSubPeerCreation,
        );
      } catch (error) {
        return reject(error);
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
    const { constraints, bitrate, } = VideoService.getCameraProfile();
    const peerOptions = {
      mediaConstraints: {
        audio: false,
        video: constraints,
      },
      onicecandidate: this._getOnIceCandidateCallback(stream, isLocal),
      configuration: {
        iceTransportPolicy: shouldForceRelay() ? 'relay' : undefined,
      }
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
          meetingId: this.info.meetingId,
          voiceBridge: this.info.voiceBridge,
          userId: this.info.userId,
          userName: this.info.userName,
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

        this.sendMessage(message);
        this.setReconnectionTimeout(stream, isLocal, false);

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
    const { intl } = this.props;
    const errorMessage = intlClientErrors[error.name] || intlSFUErrors[error];

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
      if (errorMessage) VideoService.notify(intl.formatMessage(errorMessage));
    } else {
      // If it's a viewer, set the reconnection timeout. There's a good chance
      // no local candidate was generated and it wasn't set.
      const peer = this.webRtcPeers[stream];
      const isEstablishedConnection = peer && peer.started;
      this.setReconnectionTimeout(stream, isLocal, isEstablishedConnection);
      // second argument means it will only try to reconnect if
      // it's a viewer instance (see stopWebRTCPeer restarting argument)
      this.stopWebRTCPeer(stream, true);
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

  _handleIceConnectionStateChange(stream, isLocal) {
    const { intl } = this.props;
    const peer = this.webRtcPeers[stream];
    const role = VideoService.getRole(isLocal);

    if (peer && peer.peerConnection) {
      const pc = peer.peerConnection;
      const connectionState = pc.connectionState;
      notifyStreamStateChange(stream, connectionState);

      if (connectionState === 'failed' || connectionState === 'closed') {
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
        if (isLocal) VideoService.notify(intl.formatMessage(intlClientErrors.iceConnectionStateError));

        this._onWebRTCError(error, stream, isLocal);
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
    const video = this.getVideoElement(stream);

    if (video == null) {
      logger.warn({
        logCode: 'video_provider_delay_attach_video_stream',
        extraInfo: { cameraId: stream },
      }, 'Delaying video stream attachment');
      return;
    }

    const isLocal = VideoService.isLocalStream(stream);
    const peer = this.webRtcPeers[stream];

    if (peer && peer.attached && video.srcObject) {
      return; // Skip if the stream is already attached
    }

    // Conditions to safely attach a stream to a video element in all browsers:
    // 1 - Peer exists
    // 2 - It hasn't been attached yet
    // 3a - If the stream is a local one (webcam sharer), we can just attach it
    // (no need to wait for server confirmation)
    // 3b - If the stream is a remote one, the safest (*ahem* Safari) moment to
    // do so is waiting for the server to confirm that media has flown out of it
    // towards the remote end.
    const isAbleToAttach = peer && !peer.attached && (peer.started || isLocal);
    if (isAbleToAttach) {
      this.attach(peer, video);
      peer.attached = true;

      if (isLocal) {
        const deviceId = MediaStreamUtils.extractVideoDeviceId(peer.bbbVideoStream.mediaStream);
        const { type, name } = getSessionVirtualBackgroundInfo(deviceId);

        this.restoreVirtualBackground(peer.bbbVideoStream, type, name).catch((error) => {
          this.handleVirtualBgError(error, type, name);
        });
      }
    }
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

    notify(intl.formatMessage(intlMessages.virtualBgGenericError), 'error', 'video');
  }

  createVideoTag(stream, video) {
    const peer = this.webRtcPeers[stream];
    this.videoTags[stream] = video;

    if (peer && !peer.attached) {
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

      if (!peer.attached) {
        this.attachVideoStream(stream);
      }

      VideoService.playStart(stream);
    } else {
      logger.warn({
        logCode: 'video_provider_playstart_no_peer',
        extraInfo: { cameraId: stream, role },
      }, 'Trailing camera playStart response.');
    }
  }

  handleSFUError(message) {
    const { intl } = this.props;
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
      VideoService.stopVideo(streamId);
      VideoService.notify(intl.formatMessage(intlSFUErrors[code] || intlSFUErrors[2200]));
    } else {
      this.stopWebRTCPeer(streamId, true);
    }
  }

  replacePCVideoTracks (streamId, mediaStream) {
    let replaced = false;
    const peer = this.webRtcPeers[streamId];
    const videoElement = this.getVideoElement(streamId);

    if (peer == null || mediaStream == null || videoElement == null) return;

    const pc = peer.peerConnection;
    const newTracks = mediaStream.getVideoTracks();

    if (pc) {
      try {
        pc.getSenders().forEach((sender, index) => {
          if (sender.track && sender.track.kind === 'video') {
            const newTrack = newTracks[index];
            if (newTrack == null) return;
            sender.replaceTrack(newTrack);
            replaced = true;
          }
        });
      } catch (error) {
        logger.error({
          logCode: 'video_provider_replacepc_error',
          extraInfo: { errorMessage: error.message, cameraId: streamId },
        }, `Failed to replace peer connection tracks: ${error.message}`);
      }
    }

    if (replaced) {
      peer.localStream = mediaStream;
      this.attach(peer, videoElement);
    }
  }

  render() {
    const {
      swapLayout,
      currentVideoPageIndex,
      streams,
      cameraDockBounds,
    } = this.props;

    return (
      <VideoListContainer
        {...{
          streams,
          swapLayout,
          currentVideoPageIndex,
          cameraDockBounds,
        }}
        onVideoItemMount={this.createVideoTag}
        onVideoItemUnmount={this.destroyVideoTag}
      />
    );
  }
}

VideoProvider.propTypes = propTypes;

export default injectIntl(VideoProvider);

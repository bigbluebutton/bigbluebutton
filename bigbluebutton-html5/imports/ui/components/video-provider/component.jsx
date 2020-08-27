import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReconnectingWebSocket from 'reconnecting-websocket';
import VideoService from './service';
import VideoListContainer from './video-list/container';
import { defineMessages, injectIntl } from 'react-intl';
import {
  fetchWebRTCMappedStunTurnServers,
  getMappedFallbackStun,
} from '/imports/utils/fetchStunTurnServers';
import { tryGenerateIceCandidates } from '/imports/utils/safari-webrtc';
import logger from '/imports/startup/client/logger';
import _ from 'lodash';

// Default values and default empty object to be backwards compat with 2.2.
// FIXME Remove hardcoded defaults 2.3.
const WS_CONN_TIMEOUT = Meteor.settings.public.kurento.wsConnectionTimeout || 4000;

const {
  baseTimeout: CAMERA_SHARE_FAILED_WAIT_TIME = 15000,
  maxTimeout: MAX_CAMERA_SHARE_FAILED_WAIT_TIME = 60000,
} = Meteor.settings.public.kurento.cameraTimeouts || {};
const CAMERA_QUALITY_THRESHOLDS_ENABLED = Meteor.settings.public.kurento.cameraQualityThresholds.enabled;
const PING_INTERVAL = 15000;

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
  constructor(props) {
    super(props);

    this.state = {
      socketOpen: false,
    };

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
    this.onWsOpen = this.onWsOpen.bind(this);
    this.onWsClose = this.onWsClose.bind(this);
    this.onWsMessage = this.onWsMessage.bind(this);

    this.onBeforeUnload = this.onBeforeUnload.bind(this);

    this.updateStreams = this.updateStreams.bind(this);
    this.debouncedConnectStreams = _.debounce(
      this.connectStreams,
      VideoService.getPageChangeDebounceTime(),
      { leading: false, trailing: true, }
    );
  }

  componentDidMount() {
    this.ws.onopen = this.onWsOpen;
    this.ws.onclose = this.onWsClose;

    window.addEventListener('online', this.openWs);
    window.addEventListener('offline', this.onWsClose);

    this.ws.onmessage = this.onWsMessage;

    window.addEventListener('beforeunload', this.onBeforeUnload);
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
    this.ws.onmessage = null;
    this.ws.onopen = null;
    this.ws.onclose = null;

    window.removeEventListener('online', this.openWs);
    window.removeEventListener('offline', this.onWsClose);

    window.removeEventListener('beforeunload', this.onBeforeUnload);

    VideoService.exitVideo();

    Object.keys(this.webRtcPeers).forEach((cameraId) => {
      this.stopWebRTCPeer(cameraId);
    });

    // Close websocket connection to prevent multiple reconnects from happening
    this.ws.close();
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
    logger.debug({
      logCode: 'video_provider_onwsclose',
    }, 'Multiple video provider websocket connection closed.');

    clearInterval(this.pingInterval);

    VideoService.exitVideo();

    this.setState({ socketOpen: false });
  }

  onWsOpen() {
    logger.debug({
      logCode: 'video_provider_onwsopen',
    }, 'Multiple video provider websocket connection opened.');

    // Resend queued messages that happened when socket was not connected
    while (this.wsQueue.length > 0) {
      this.sendMessage(this.wsQueue.pop());
    }

    this.pingInterval = setInterval(this.ping.bind(this), PING_INTERVAL);

    this.setState({ socketOpen: true });
  }

  onBeforeUnload() {
    VideoService.onBeforeUnload();
  }

  updateThreshold (numberOfPublishers) {
    const { threshold, profile } = VideoService.getThreshold(numberOfPublishers);
    if (profile) {
      const publishers = Object.values(this.webRtcPeers)
        .filter(peer => peer.isPublisher)
        .forEach(peer => {
          // 0 means no threshold in place. Reapply original one if needed
          let profileToApply = (threshold === 0) ? peer.originalProfileId : profile;
          VideoService.applyCameraProfile(peer, profileToApply)
        });
    }
  }

  getStreamsToConnectAndDisconnect(streams) {
    const streamsCameraIds = streams.map(s => s.cameraId);
    const streamsConnected = Object.keys(this.webRtcPeers);

    const streamsToConnect = streamsCameraIds.filter(cameraId => {
      return !streamsConnected.includes(cameraId);
    });

    const streamsToDisconnect = streamsConnected.filter(cameraId => {
      return !streamsCameraIds.includes(cameraId);
    });

    return [streamsToConnect, streamsToDisconnect];
  }

  connectStreams(streamsToConnect) {
    streamsToConnect.forEach((cameraId) => {
      const isLocal = VideoService.isLocalStream(cameraId);
      this.createWebRTCPeer(cameraId, isLocal);
    });
  }

  disconnectStreams(streamsToDisconnect) {
    streamsToDisconnect.forEach(cameraId => this.stopWebRTCPeer(cameraId));
  }

  updateStreams(streams, shouldDebounce = false) {
    const [streamsToConnect, streamsToDisconnect] = this.getStreamsToConnectAndDisconnect(streams);

    if(shouldDebounce) {
      this.debouncedConnectStreams(streamsToConnect);
    } else {
      this.connectStreams(streamsToConnect);
    }

    this.disconnectStreams(streamsToDisconnect);

    if (CAMERA_QUALITY_THRESHOLDS_ENABLED) {
      this.updateThreshold(this.props.totalNumberOfStreams);
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
              sfuRequest: message,
              error,
            },
          }, `WebSocket failed when sending request to SFU due to ${error.message}`);
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

  processOutboundIceQueue(peer, role, cameraId) {
    const queue = this.outboundIceQueues[cameraId];
    while (queue && queue.length) {
      const candidate = queue.shift();
      this.sendIceCandidateToSFU(peer, role, candidate, cameraId);
    }
  }

  startResponse(message) {
    const { cameraId, role } = message;
    const peer = this.webRtcPeers[cameraId];

    logger.info({
      logCode: 'video_provider_start_response_success',
      extraInfo: {
        cameraId,
        sfuResponse: message,
      },
    }, `Camera start request was accepted by SFU, processing response for ${cameraId}`);

    if (peer) {
      peer.processAnswer(message.sdpAnswer, (error) => {
        if (error) {
          logger.error({
            logCode: 'video_provider_peerconnection_processanswer_error',
            extraInfo: {
              cameraId,
              error,
            },
          }, `Processing SDP answer from SFU for ${cameraId} failed due to ${error.message}`);

          return;
        }

        peer.didSDPAnswered = true;
        this.processOutboundIceQueue(peer, role, cameraId);
        VideoService.processInboundIceQueue(peer, cameraId);
      });
    } else {
      logger.warn({
        logCode: 'video_provider_startresponse_no_peer',
      }, `SFU start response for ${cameraId} arrived after the peer was discarded, ignore it.`);
    }
  }

  handleIceCandidate(message) {
    const { cameraId, candidate } = message;
    const peer = this.webRtcPeers[cameraId];

    logger.debug({
      logCode: 'video_provider_ice_candidate_received',
      extraInfo: {
        candidate,
      },
    }, `video-provider received candidate for ${cameraId}: ${JSON.stringify(candidate)}`);

    if (peer) {
      if (peer.didSDPAnswered) {
        VideoService.addCandidateToPeer(peer, candidate, cameraId);
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
      }, `SFU ICE candidate for ${cameraId} arrived after the peer was discarded, ignore it.`);
    }
  }

  stopWebRTCPeer(cameraId, restarting = false) {
    const isLocal = VideoService.isLocalStream(cameraId);

    // in this case, 'closed' state is not caused by an error;
    // we stop listening to prevent this from being treated as an error
    const peer = this.webRtcPeers[cameraId];
    if (peer && peer.peerConnection) {
      const conn = peer.peerConnection;
      conn.oniceconnectionstatechange = null;
    }

    if (isLocal) {
      VideoService.stopVideo(cameraId);
    }

    const role = VideoService.getRole(isLocal);

    logger.info({
      logCode: 'video_provider_stopping_webcam_sfu',
    }, `Sending stop request to SFU. Camera: ${cameraId}, role ${role} and flag restarting ${restarting}`);
    this.sendMessage({
      id: 'stop',
      type: 'video',
      cameraId,
      role,
    });

    // Clear the shared camera media flow timeout and current reconnect period
    // when destroying it if the peer won't restart
    if (!restarting) {
      if (this.restartTimeout[cameraId]) {
        clearTimeout(this.restartTimeout[cameraId]);
        delete this.restartTimeout[cameraId];
      }

      if (this.restartTimer[cameraId]) {
        delete this.restartTimer[cameraId];
      }
    }

    this.destroyWebRTCPeer(cameraId);
  }

  destroyWebRTCPeer(cameraId) {
    const peer = this.webRtcPeers[cameraId];
    if (peer) {
      logger.info({
        logCode: 'video_provider_destroywebrtcpeer',
      }, `Disposing WebRTC peer ${cameraId}`);
      if (typeof peer.dispose === 'function') {
        peer.dispose();
      }
      delete this.outboundIceQueues[cameraId];
      delete this.webRtcPeers[cameraId];
    } else {
      logger.warn({
        logCode: 'video_provider_destroywebrtcpeer_no_peer',
      }, `Peer ${cameraId} was already disposed (glare), ignore it.`);
    }
  }

  async createWebRTCPeer(cameraId, isLocal) {
    let iceServers = [];

    // Check if the peer is already being processed
    if (this.webRtcPeers[cameraId]) {
      return;
    }

    this.webRtcPeers[cameraId] = {};

    // WebRTC restrictions may need a capture device permission to release
    // useful ICE candidates on recvonly/no-gUM peers
    if (!isLocal) {
      try {
        await tryGenerateIceCandidates();
      } catch (error) {
        logger.error({
          logCode: 'video_provider_no_valid_candidate_gum_failure',
          extraInfo: {
            errorName: error.name,
            errorMessage: error.message,
          },
        }, `Forced gUM to release additional ICE candidates failed due to ${error.name}.`);
      }
    }

    try {
      iceServers = await fetchWebRTCMappedStunTurnServers(this.info.sessionToken);
    } catch (error) {
      logger.error({
        logCode: 'video_provider_fetchstunturninfo_error',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
        },
      }, 'video-provider failed to fetch STUN/TURN info, using default');
      // Use fallback STUN server
      iceServers = getMappedFallbackStun();
    } finally {
      const { constraints, bitrate, id: profileId } = VideoService.getCameraProfile();
      this.outboundIceQueues[cameraId] = [];
      const peerOptions = {
        mediaConstraints: {
          audio: false,
          video: constraints,
        },
        onicecandidate: this._getOnIceCandidateCallback(cameraId, isLocal),
      };

      if (iceServers.length > 0) {
        peerOptions.configuration = {};
        peerOptions.configuration.iceServers = iceServers;
      }

      let WebRtcPeerObj;
      if (isLocal) {
        WebRtcPeerObj = window.kurentoUtils.WebRtcPeer.WebRtcPeerSendonly;
      } else {
        WebRtcPeerObj = window.kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly;
      }

      this.webRtcPeers[cameraId] = new WebRtcPeerObj(peerOptions, (error) => {
        const peer = this.webRtcPeers[cameraId];

        peer.started = false;
        peer.attached = false;
        peer.didSDPAnswered = false;
        peer.isPublisher = isLocal;
        peer.originalProfileId = profileId;
        peer.currentProfileId = profileId;

        if (peer.inboundIceQueue == null) {
          peer.inboundIceQueue = [];
        }

        if (error) {
          return this._onWebRTCError(error, cameraId, isLocal);
        }

        peer.generateOffer((errorGenOffer, offerSdp) => {
          if (errorGenOffer) {
            return this._onWebRTCError(errorGenOffer, cameraId, isLocal);
          }

          const message = {
            id: 'start',
            type: 'video',
            cameraId,
            role: VideoService.getRole(isLocal),
            sdpOffer: offerSdp,
            meetingId: this.info.meetingId,
            voiceBridge: this.info.voiceBridge,
            userId: this.info.userId,
            userName: this.info.userName,
            bitrate,
            record: VideoService.getRecord(),
          };

          logger.info({
            logCode: 'video_provider_sfu_request_start_camera',
            extraInfo: {
              sfuRequest: message,
              cameraProfile: profileId,
            },
          }, `Camera offer generated. Sending start request to SFU for ${cameraId}`);

          this.sendMessage(message);

          return false;
        });
        return false;
      });

      const peer = this.webRtcPeers[cameraId];
      if (peer && peer.peerConnection) {
        const conn = peer.peerConnection;
        conn.oniceconnectionstatechange = this._getOnIceConnectionStateChangeCallback(cameraId, isLocal);
        VideoService.monitor(conn);
      }
    }
  }

  _getWebRTCStartTimeout(cameraId, isLocal) {
    const { intl } = this.props;

    return () => {
      // Peer that timed out is a sharer/publisher
      if (isLocal) {
        logger.error({
          logCode: 'video_provider_camera_share_timeout',
          extraInfo: { cameraId },
        }, `Camera SHARER has not succeeded in ${CAMERA_SHARE_FAILED_WAIT_TIME} for ${cameraId}`);

        VideoService.notify(intl.formatMessage(intlClientErrors.mediaFlowTimeout));
        this.stopWebRTCPeer(cameraId);
      } else {
        // Create new reconnect interval time
        const oldReconnectTimer = this.restartTimer[cameraId];
        const newReconnectTimer = Math.min(
          2 * oldReconnectTimer,
          MAX_CAMERA_SHARE_FAILED_WAIT_TIME,
        );
        this.restartTimer[cameraId] = newReconnectTimer;

        // Clear the current reconnect interval so it can be re-set in createWebRTCPeer
        if (this.restartTimeout[cameraId]) {
          delete this.restartTimeout[cameraId];
        }

        // Peer that timed out is a subscriber/viewer
        // Subscribers try to reconnect according to their timers if media could
        // not reach the server. That's why we pass the restarting flag as true
        // to the stop procedure as to not destroy the timers
        logger.error({
          logCode: 'video_provider_camera_view_timeout',
          extraInfo: {
            cameraId,
            oldReconnectTimer,
            newReconnectTimer,
          },
        }, `Camera VIEWER has not succeeded in ${oldReconnectTimer} for ${cameraId}. Reconnecting.`);

        this.stopWebRTCPeer(cameraId, true);
        this.createWebRTCPeer(cameraId, isLocal);
      }
    };
  }

  _onWebRTCError(error, cameraId, isLocal) {
    const { intl } = this.props;

    // 2001 means MEDIA_SERVER_OFFLINE. It's a server-wide error.
    // We only display it to a sharer/publisher instance to avoid popping up
    // redundant toasts.
    // If the client only has viewer instances, the WS will close unexpectedly
    // and an error will be shown there for them.
    if (error === 2001 && !isLocal) {
      return;
    }

    const errorMessage = intlClientErrors[error.name]
      || intlSFUErrors[error] || intlClientErrors.permissionError;
    // Only display WebRTC negotiation error toasts to sharers. The viewer streams
    // will try to autoreconnect silently, but the error will log nonetheless
    if (isLocal) {
      VideoService.notify(intl.formatMessage(errorMessage));
    } else {
      // If it's a viewer, set the reconnection timeout. There's a good chance
      // no local candidate was generated and it wasn't set.
      this.setReconnectionTimeout(cameraId, isLocal);
    }

    // shareWebcam as the second argument means it will only try to reconnect if
    // it's a viewer instance (see stopWebRTCPeer restarting argument)
    this.stopWebRTCPeer(cameraId, !isLocal);

    logger.error({
      logCode: 'video_provider_webrtc_peer_error',
      extraInfo: {
        cameraId,
        normalizedError: errorMessage,
        error,
      },
    }, `Camera peer creation failed for ${cameraId} due to ${error.message}`);
  }

  setReconnectionTimeout(cameraId, isLocal) {
    const peer = this.webRtcPeers[cameraId];
    const peerHasStarted = peer && peer.started === true;
    const shouldSetReconnectionTimeout = !this.restartTimeout[cameraId] && !peerHasStarted;

    if (shouldSetReconnectionTimeout) {
      const newReconnectTimer = this.restartTimer[cameraId] || CAMERA_SHARE_FAILED_WAIT_TIME;
      this.restartTimer[cameraId] = newReconnectTimer;

      logger.info({
        logCode: 'video_provider_setup_reconnect',
        extraInfo: {
          cameraId,
          reconnectTimer: newReconnectTimer,
        },
      }, `Camera has a new reconnect timer of ${newReconnectTimer} ms for ${cameraId}`);

      this.restartTimeout[cameraId] = setTimeout(
        this._getWebRTCStartTimeout(cameraId, isLocal),
        this.restartTimer[cameraId]
      );
    }
  }

  _getOnIceCandidateCallback(cameraId, isLocal) {
    return (candidate) => {
      const peer = this.webRtcPeers[cameraId];
      const role = VideoService.getRole(isLocal);
      // Setup a timeout only when the first candidate is generated and if the peer wasn't
      // marked as started already (which is done on handlePlayStart after
      // it was verified that media could circle through the server)
      this.setReconnectionTimeout(cameraId, isLocal);

      if (peer && !peer.didSDPAnswered) {
        logger.debug({
          logCode: 'video_provider_client_candidate',
          extraInfo: { candidate },
        }, `video-provider client-side candidate queued for ${cameraId}`);
        this.outboundIceQueues[cameraId].push(candidate);
        return;
      }

      this.sendIceCandidateToSFU(peer, role, candidate, cameraId);
    };
  }

  sendIceCandidateToSFU(peer, role, candidate, cameraId) {
    logger.debug({
      logCode: 'video_provider_client_candidate',
      extraInfo: { candidate },
    }, `video-provider client-side candidate generated for ${cameraId}: ${JSON.stringify(candidate)}`);
    const message = {
      type: 'video',
      role,
      id: 'onIceCandidate',
      candidate,
      cameraId,
    };
    this.sendMessage(message);
  }

  _getOnIceConnectionStateChangeCallback(cameraId, isLocal) {
    const { intl } = this.props;
    const peer = this.webRtcPeers[cameraId];
    if (peer && peer.peerConnection) {
      const conn = peer.peerConnection;
      const { iceConnectionState } = conn;

      return () => {
        if (iceConnectionState === 'failed' || iceConnectionState === 'closed') {
          // prevent the same error from being detected multiple times
          conn.oniceconnectionstatechange = null;
          logger.error({
            logCode: 'video_provider_ice_connection_failed_state',
            extraInfo: {
              cameraId,
              iceConnectionState,
            },
          }, `ICE connection state transitioned to ${iceConnectionState} for ${cameraId}`);

          this.stopWebRTCPeer(cameraId);
          VideoService.notify(intl.formatMessage(intlClientErrors.iceConnectionStateError));
        }
      };
    }
    return () => {
      logger.error({
        logCode: 'video_provider_ice_connection_failed_state',
        extraInfo: {
          cameraId,
          iceConnectionState: undefined,
        },
      }, `Missing peer at ICE connection state transition for ${cameraId}`);

      // isLocal as the second argument means it will only try to reconnect if
      // it's a viewer instance (see stopWebRTCPeer restarting argument)
      this.stopWebRTCPeer(cameraId, !isLocal);
      VideoService.notify(intl.formatMessage(intlClientErrors.iceConnectionStateError));
    };
  }

  attachVideoStream(cameraId) {
    const video = this.videoTags[cameraId];
    if (video == null) {
      logger.warn({
        logCode: 'video_provider_delay_attach_video_stream',
        extraInfo: { cameraId },
      }, `Will attach stream later because camera has not started yet for ${cameraId}`);
      return;
    }

    if (video.srcObject) {
      delete this.videoTags[cameraId];
      return; // Skip if the stream is already attached
    }

    const isLocal = VideoService.isLocalStream(cameraId);
    const peer = this.webRtcPeers[cameraId];

    const attachVideoStreamHelper = () => {
      const stream = isLocal ? peer.getLocalStream() : peer.getRemoteStream();
      video.pause();
      video.srcObject = stream;
      video.load();

      peer.attached = true;
      delete this.videoTags[cameraId];
    };


    // If peer has started playing attach to tag, otherwise wait a while
    if (peer) {
      if (peer.started) {
        attachVideoStreamHelper();
      }

      // So we can start it later when we get a playStart
      // or if we need to do a restart timeout
      peer.videoTag = video;
    }
  }

  createVideoTag(cameraId, video) {
    const peer = this.webRtcPeers[cameraId];
    this.videoTags[cameraId] = video;

    if (peer) {
      this.attachVideoStream(cameraId);
    }
  }

  handlePlayStop(message) {
    const { cameraId } = message;

    logger.info({
      logCode: 'video_provider_handle_play_stop',
      extraInfo: {
        cameraId,
        sfuRequest: message,
      },
    }, `Received request from SFU to stop camera ${cameraId}`);
    this.stopWebRTCPeer(cameraId, false);
  }

  handlePlayStart(message) {
    const { cameraId } = message;
    const peer = this.webRtcPeers[cameraId];

    if (peer) {
      logger.info({
        logCode: 'video_provider_handle_play_start_flowing',
        extraInfo: {
          cameraId,
          sfuResponse: message,
        },
      }, `SFU says that media is flowing for camera ${cameraId}`);

      peer.started = true;

      // Clear camera shared timeout when camera succesfully starts
      clearTimeout(this.restartTimeout[cameraId]);
      delete this.restartTimeout[cameraId];
      delete this.restartTimer[cameraId];

      if (!peer.attached) {
        this.attachVideoStream(cameraId);
      }

      VideoService.playStart(cameraId);
    } else {
      logger.warn({ logCode: 'video_provider_playstart_no_peer' },
        `SFU playStart response for ${cameraId} arrived after the peer was discarded, ignore it.`);
    }
  }

  handleSFUError(message) {
    const { intl } = this.props;
    const { code, reason, streamId } = message;
    const cameraId = streamId;
    logger.error({
      logCode: 'video_provider_handle_sfu_error',
      extraInfo: {
        error: message,
        cameraId,
      },
    }, `SFU returned error for camera ${cameraId}. Code: ${code}, reason: ${reason}`);

    const isLocal = VideoService.isLocalStream(cameraId);
    if (isLocal) {
      // The publisher instance received an error from the server. There's no reconnect,
      // stop it.
      VideoService.stopVideo(cameraId);
      VideoService.notify(intl.formatMessage(intlSFUErrors[code] || intlSFUErrors[2200]));
    } else {
      this.stopWebRTCPeer(cameraId, true);
    }
  }

  render() {
    const { swapLayout, currentVideoPageIndex, streams } = this.props;

    return (
      <VideoListContainer
        streams={streams}
        onMount={this.createVideoTag}
        swapLayout={swapLayout}
        currentVideoPageIndex={currentVideoPageIndex}
      />
    );
  }
}

VideoProvider.propTypes = propTypes;

export default injectIntl(VideoProvider);

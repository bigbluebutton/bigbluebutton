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
import { createVirtualBackgroundService } from '../../services/virtual-background';

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
  static onBeforeUnload() {
    VideoService.onBeforeUnload();
  }

  constructor(props) {
    super(props);

    this.state = {
      socketOpen: false,
      virtualBgIsActive: [],
      cameraTrack: [],
      cameraProfiles: [],
      virtualCanvasRefs: [],
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
    this.virtualBgChangeHandler = this.virtualBgChangeHandler.bind(this);
  }

  componentDidMount() {
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

  updateThreshold(numberOfPublishers) {
    const { threshold, profile } = VideoService.getThreshold(numberOfPublishers);
    if (profile) {
      const publishers = Object.values(this.webRtcPeers)
        .filter(peer => peer.isPublisher)
        .forEach((peer) => {
          // 0 means no threshold in place. Reapply original one if needed
          const profileToApply = (threshold === 0) ? peer.originalProfileId : profile;
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

  startResponse(message) {
    const { cameraId: stream, role } = message;
    const peer = this.webRtcPeers[stream];

    logger.debug({
      logCode: 'video_provider_start_response_success',
      extraInfo: { cameraId: stream, role },
    }, `Camera start request accepted by SFU. Role: ${role}`);

    if (peer) {
      peer.processAnswer(message.sdpAnswer, (error) => {
        if (error) {
          logger.error({
            logCode: 'video_provider_peerconnection_processanswer_error',
            extraInfo: {
              cameraId: stream,
              role,
              errorMessage: error.message,
              errorCode: error.code,
            },
          }, 'Camera answer processing failed');

          return;
        }

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
    if (isLocal) {
      this.destroyVirtualBackgroundStream(true, stream);
    }

  }

  destroyWebRTCPeer(stream) {
    const peer = this.webRtcPeers[stream];
    const isLocal = VideoService.isLocalStream(stream);
    const role = VideoService.getRole(isLocal);

    if (peer) {
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

  async createWebRTCPeer(stream, isLocal) {
    let iceServers = [];
    const role = VideoService.getRole(isLocal);
    const { cameraProfiles } = this.state;

    // Check if the peer is already being processed
    if (this.webRtcPeers[stream]) {
      return;
    }

    this.webRtcPeers[stream] = {};

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
      const { constraints, bitrate, id: profileId } = VideoService.getCameraProfile();
      this.outboundIceQueues[stream] = [];
      const peerOptions = {
        mediaConstraints: {
          audio: false,
          video: constraints,
        },
        onicecandidate: this._getOnIceCandidateCallback(stream, isLocal),
      };

      const virtualBackgroundInformation = VideoService.getVirtualBackgroundInformation();
      if(this.virtualBackgroundInformationExists(virtualBackgroundInformation) && isLocal) {
        const virtualBackgroundParameters = {
          isVirtualBackground: virtualBackgroundInformation.isVirtualBackground,
          backgroundFilename: virtualBackgroundInformation.name,
          backgroundType: virtualBackgroundInformation.type,
        }
        const replacement = await this.createVirtualBackgroundStream(virtualBackgroundParameters, constraints, stream);
        if (replacement instanceof MediaStream) {
          peerOptions.videoStream = replacement;
        } else {
          this.handleVirtualBackgroundError('do_virtualbg_provider', replacement, 'creating virtual background service instance');
          this.destroyVirtualBackgroundStream(false, stream);
        }
      }

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

      if (isLocal) {
        // Save camera profiles to prevent camera mixups when enabling/disabling streams
        let newCameraProfileArr = [];
        let cameraIndex = -1;
        if (cameraProfiles.length > 0) {
          cameraProfiles.forEach((cameraObj, i) => {
            if (cameraObj.stream === stream) {
              cameraIndex = i;
            }
          });
        }

        if (cameraIndex < 0) {
          newCameraProfileArr = cameraProfiles;
          const newConstraints = Object.assign({}, constraints);
          newCameraProfileArr.push({stream, constraints: newConstraints});
          this.setState({
            cameraProfiles: newCameraProfileArr
            })
        }
      }

      this.webRtcPeers[stream] = new WebRtcPeerObj(peerOptions, (error) => {
        const peer = this.webRtcPeers[stream];

        peer.stream = stream;
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
          return this._onWebRTCError(error, stream, isLocal);
        }

        peer.generateOffer((errorGenOffer, offerSdp) => {
          if (errorGenOffer) {
            return this._onWebRTCError(errorGenOffer, stream, isLocal);
          }

          const message = {
            id: 'start',
            type: 'video',
            cameraId: stream,
            role,
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
              cameraId: stream,
              cameraProfile: profileId,
              role,
            },
          }, `Camera offer generated. Role: ${role}`);

          this.sendMessage(message);
          this.setReconnectionTimeout(stream, isLocal, false);

          return false;
        });
        return false;
      });

      const peer = this.webRtcPeers[stream];
      if (peer && peer.peerConnection) {
        const conn = peer.peerConnection;
        conn.onconnectionstatechange = () => {
          this._handleIceConnectionStateChange(stream, isLocal);
        };
      }
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

  attachVideoStream(stream) {
    const video = this.videoTags[stream];

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

    const attachVideoStreamHelper = () => {
      const stream = isLocal ? peer.getLocalStream() : peer.getRemoteStream();
      video.pause();
      video.srcObject = stream;
      video.load();
      peer.attached = true;
    };

    // Conditions to safely attach a stream to a video element in all browsers:
    // 1 - Peer exists
    // 2 - It hasn't been attached yet
    // 3a - If the stream is a local one (webcam sharer), we can just attach it
    // (no need to wait for server confirmation)
    // 3b - If the stream is a remote one, the safest (*ahem* Safari) moment to
    // do so is waiting for the server to confirm that media has flown out of it
    // towards the remote end.
    const isAbleToAttach = peer && !peer.attached && (peer.started || isLocal);
    if (isAbleToAttach) attachVideoStreamHelper();
  }

  createVideoTag(stream, video) {
    const peer = this.webRtcPeers[stream];
    this.videoTags[stream] = video;

    if (peer && !peer.attached) {
      this.attachVideoStream(stream);
    }
  }

  destroyVideoTag(stream) {
    delete this.videoTags[stream]
  }

  handlePlayStop(message) {
    const { cameraId: stream, role } = message;

    logger.info({
      logCode: 'video_provider_handle_play_stop',
      extraInfo: {
        cameraId: stream,
        role,
      },
    }, `Received request from SFU to stop camera. Role: ${role}`);
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

  virtualBackgroundInformationExists(virtualBackgroundInformation) {
    return (virtualBackgroundInformation != null && Object.keys(virtualBackgroundInformation).length > 0);
  }

  handleVirtualBackgroundError(logCode, error, description) {
    logger.warn({
      logCode: `video_preview_${logCode}_error`,
      extraInfo: {
        errorName: error.name,
        errorMessage: error.message,
      },
    }, `Error ${description}`);
  }

  /**
   * Replace RTCRtpSender and WebRTCPeer (local) tracks. Accepts "data" (boolean)
   * and "stream" (string). If no virtual background information exists, the blur
   * effect is toggled.
   * @param {boolean} data
   * @param {string} stream
   * @returns
   */
  async virtualBgChangeHandler(data, stream) {
    const cameraProfile = VideoService.getCameraProfile();
    const deviceId = cameraProfile.constraints.deviceId.exact;
    const localStreams = this.webRtcPeers[stream].peerConnection.getSenders();
    const { cameraTrack } = this.state;

    if (deviceId == null) {
      return;
    }
    if(data) {
      const virtualBackgroundInformation = VideoService.getVirtualBackgroundInformation();
      let virtualBackgroundParameters = null;
      if(this.virtualBackgroundInformationExists(virtualBackgroundInformation)) {
        virtualBackgroundParameters = {
          isVirtualBackground: virtualBackgroundInformation.isVirtualBackground,
          backgroundFilename: virtualBackgroundInformation.name,
          backgroundType: virtualBackgroundInformation.type,
        }
      }

      let trackToReplace = {
        stream
      };
      // Replace local track
      this.webRtcPeers[stream].localStream.getVideoTracks().forEach(track => {
        this.webRtcPeers[stream].localStream.removeTrack(track);
        trackToReplace.track = track;
      });

      // Use existing track if given
      const replacement = await this.createVirtualBackgroundStream(virtualBackgroundParameters, cameraProfile.constraints, stream, trackToReplace);
      this.webRtcPeers[stream].localStream.addTrack(replacement.getTracks()[0]);
      // Replace RTCRtpSender track
      localStreams.forEach(localStream => {
        localStream.replaceTrack(replacement.getTracks()[0]);
      });

    } else {
      let replacement = null;

      // Use existing cameraTrack (if exists)
      if (cameraTrack != null && cameraTrack.length > 0) {
        cameraTrack.forEach((trackObj, i) => {
          if (trackObj.stream === stream) {
            replacement = new MediaStream();
            replacement.addTrack(trackObj.track);
          }
        });
      }

      if(replacement == null) {
        replacement = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: cameraProfile.constraints,
        }).then((val) => {
          return val
        });
      }

      // Replace local track
      this.webRtcPeers[stream].localStream.getVideoTracks().forEach(track => {
        this.webRtcPeers[stream].localStream.removeTrack(track);
      });
      this.webRtcPeers[stream].localStream.addTrack(replacement.getTracks()[0]);

      // Replace RTCRtpSender track
      localStreams.forEach(localStream => {
        localStream.replaceTrack(replacement.getTracks()[0]);
      });
      this.destroyVirtualBackgroundStream(false, stream);
    }
  }

  /**
   *
   * @param {Object} parameters
   * @param {Object} constraints
   * @returns {MediaStream}
   */
  async createVirtualBackgroundStream(parameters, constraints, stream, trackToReplace = null) {
    const { virtualBgIsActive, cameraTrack, cameraProfiles, virtualCanvasRefs } = this.state;

    // Use previously saved profiles to prevent camera mixups when enabling/disabling streams
    let cameraIndex = -1;
    if (cameraProfiles.length > 0) {
      cameraProfiles.forEach((cameraObj, i) => {
        if (cameraObj.stream === stream) {
          cameraIndex = i;
        }
      });
    }

    if (cameraIndex >= 0) {
      constraints = cameraProfiles[cameraIndex].constraints;
    }

    // Use existing track if saved in state
    let tracks = null;
    let newCameraTrackArr = cameraTrack;
    let trackIndex = -1;
    if (cameraTrack != null && cameraTrack.length > 0) {
      cameraTrack.forEach((trackObj, i) => {
        if (trackObj.stream === stream) {
          tracks = new MediaStream();
          tracks.addTrack(trackObj.track);
          trackIndex = i;
        }
      });
    }

    // If state doesn't contain a matching track, save the given "trackToReplace" to use later
    if (
      tracks == null &&
      trackToReplace != null &&
      trackToReplace.track instanceof MediaStreamTrack
    ) {
      tracks = new MediaStream();
      tracks.addTrack(trackToReplace.track);
    }

    // If tracks are still null, get user media
    if (tracks == null) {
      tracks = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: constraints,
      }).then((val) => {
        return val
      });
    }

    if (trackIndex < 0) {
      newCameraTrackArr.push(
        {
          stream,
          track: tracks.getTracks()[0]
        }
      )
    }

    // Save virtualCanvasRef to call stopEffect() method later
    let newVirtualCanvasRefsArr = virtualCanvasRefs;
    const replacement = await createVirtualBackgroundService(parameters).then((res) => {
      let virtualCanvasIndex = -1;
      if (virtualCanvasRefs != null && virtualCanvasRefs.length > 0) {
        virtualCanvasRefs.forEach((canvasRef, i) => {
          if (canvasRef.stream === stream) {
            virtualCanvasIndex = i;
          }
        })
      }

      if (virtualCanvasIndex < 0) {
        newVirtualCanvasRefsArr.push({
          stream,
          ref: res
        });
      }

      const effect = res.startEffect(tracks);
      return effect;
    }).catch((error) => {
      return error;
    });

    // Add stream into virtualBgIsActive array. This is necessary to enable/disable the correct stream's virtual background
    // effect from video-list actions
    let newVirtualBgIsActiveArr = virtualBgIsActive;
    let streamIndex = -1;
    if (newVirtualBgIsActiveArr.length > 0) {
      newVirtualBgIsActiveArr.forEach((streamId, i) => {
        if (streamId === stream) {
          streamIndex = i;
        }
      });
    }

    if (streamIndex < 0) {
      newVirtualBgIsActiveArr.push(stream)
    }

    this.setState({
      virtualBgIsActive: [].concat(newVirtualBgIsActiveArr),
      cameraTrack: newCameraTrackArr,
      virtualCanvasRefs: newVirtualCanvasRefsArr
    });

    return replacement;
  }

  destroyVirtualBackgroundStream(stopCameraTrack = false, stream) {
    const { virtualBgIsActive, cameraTrack, virtualCanvasRefs } = this.state;
    let canvasIndex = -1;

    // Get the previously saved canvas references and call stopEffect()
    if (virtualCanvasRefs != null && virtualCanvasRefs.length > 0) {
      virtualCanvasRefs.forEach((canvasRef, i) => {
        if (canvasRef.stream === stream) {
          canvasRef.ref.stopEffect();
          canvasIndex = i;
        }
      });
    }

    let newVirtualCanvasRefsArr = virtualCanvasRefs;
    if (canvasIndex >= 0) {
      newVirtualCanvasRefsArr.splice(canvasIndex, 1);
    }

    // Get previously saved camera tracks and stop them
    let newCameraTrackArr = cameraTrack;
    let trackIndex = -1;
    if (cameraTrack != null && cameraTrack.length > 0 && stopCameraTrack) {
      cameraTrack.forEach((trackObj, i) => {
        if (trackObj.stream === stream) {
          trackObj.track.stop();
          trackIndex = i;
        }
      });
    }

    if (trackIndex > 0) {
      newCameraTrackArr.splice(trackIndex, 1);
    }


    // Set virtualBgIsActive flag states
    let newVirtualBgIsActiveArr = virtualBgIsActive;
    if (newVirtualBgIsActiveArr.length > 0) {
      newVirtualBgIsActiveArr.forEach((streamId, i) => {
        if (streamId === stream) {
          newVirtualBgIsActiveArr.splice(i, 1);
        }
      });
    }

    this.setState({
      virtualBgIsActive: [].concat(newVirtualBgIsActiveArr),
      cameraTrack: newCameraTrackArr,
      virtualCanvasRefs: newVirtualCanvasRefsArr,
    });
  }

  render() {
    const {
      swapLayout,
      currentVideoPageIndex,
      streams,
      cameraDockBounds,
    } = this.props;
    const { virtualBgIsActive } = this.state;

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
        swapLayout={swapLayout}
        currentVideoPageIndex={currentVideoPageIndex}
        virtualBgChangeHandler={this.virtualBgChangeHandler}
        virtualBgIsActive={virtualBgIsActive}
      />
    );
  }
}

VideoProvider.propTypes = propTypes;

export default injectIntl(VideoProvider);

import React, { Component } from 'react';
import { Session } from 'meteor/session';
import VisibilityEvent from '/imports/utils/visibilityEvent';
import PropTypes from 'prop-types';
import ReconnectingWebSocket from 'reconnecting-websocket';
import VideoService from './service';
import VideoList from './video-list/component';
import { defineMessages, injectIntl } from 'react-intl';
import { notify } from '/imports/ui/services/notification';
import { fetchWebRTCMappedStunTurnServers } from '/imports/utils/fetchStunTurnServers';
import { tryGenerateIceCandidates } from '/imports/utils/safari-webrtc';
import logger from '/imports/startup/client/logger';

const CAMERA_PROFILES = Meteor.settings.public.kurento.cameraProfiles;

const CAMERA_SHARE_FAILED_WAIT_TIME = 15000;
const MAX_CAMERA_SHARE_FAILED_WAIT_TIME = 60000;
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
  users: PropTypes.arrayOf(Array).isRequired,
  intl: PropTypes.objectOf(Object).isRequired,
  userIsLocked: PropTypes.bool.isRequired,
  swapLayout: PropTypes.bool.isRequired,
};

class VideoProvider extends Component {
  static getCameraProfile() {
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

  static addCandidateToPeer(peer, candidate, cameraId) {
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

  static processIceQueue(peer, cameraId) {
    while (peer.iceQueue.length) {
      const candidate = peer.iceQueue.shift();
      this.addCandidateToPeer(peer, candidate, cameraId);
    }
  }

  static notifyError(message) {
    notify(message, 'error', 'video');
  }

  constructor(props) {
    super(props);

    this.state = {
      socketOpen: false,
    };

    this.info = VideoService.getInfo();

    // Set a valid bbb-webrtc-sfu application server socket in the settings
    this.ws = new ReconnectingWebSocket(VideoService.getAuthenticatedURL());
    this.wsQueue = [];

    this.visibility = new VisibilityEvent();

    this.restartTimeout = {};
    this.restartTimer = {};
    this.webRtcPeers = {};
    this.videoTags = {};
    this.sharedWebcam = false;

    this.createVideoTag = this.createVideoTag.bind(this);
    this.onWsOpen = this.onWsOpen.bind(this);
    this.onWsClose = this.onWsClose.bind(this);
    this.onWsMessage = this.onWsMessage.bind(this);

    this.unshareWebcam = this.unshareWebcam.bind(this);
    this.shareWebcam = this.shareWebcam.bind(this);

    this.pauseViewers = this.pauseViewers.bind(this);
    this.unpauseViewers = this.unpauseViewers.bind(this);
  }

  componentWillMount() {
    this.ws.onopen = this.onWsOpen;
    this.ws.onclose = this.onWsClose;

    window.addEventListener('online', this.openWs);
    window.addEventListener('offline', this.onWsClose);
  }

  componentDidMount() {
    document.addEventListener('joinVideo', this.shareWebcam);
    document.addEventListener('exitVideo', this.unshareWebcam);
    this.ws.onmessage = this.onWsMessage;
    window.addEventListener('beforeunload', this.unshareWebcam);

    this.visibility.onVisible(this.unpauseViewers);
    this.visibility.onHidden(this.pauseViewers);
  }

  componentWillUpdate({ users }) {
    const usersSharingIds = users.map(u => u.userId);
    const usersConnected = Object.keys(this.webRtcPeers);

    const usersToConnect = usersSharingIds.filter(id => !usersConnected.includes(id));
    const usersToDisconnect = usersConnected.filter(id => !usersSharingIds.includes(id));

    usersToConnect.forEach(cameraId => {
      this.createWebRTCPeer(cameraId, VideoService.isLocalStream(cameraId));
    });
    usersToDisconnect.forEach(cameraId => this.stopWebRTCPeer(cameraId));
  }

  componentDidUpdate(prevProps) {
    const { userIsLocked } = this.props;
    if (!prevProps.userIsLocked && userIsLocked) VideoService.userGotLocked();
  }

  componentWillUnmount() {
    document.removeEventListener('joinVideo', this.shareWebcam);
    document.removeEventListener('exitVideo', this.unshareWebcam);

    this.ws.onmessage = null;
    this.ws.onopen = null;
    this.ws.onclose = null;

    window.removeEventListener('online', this.openWs);
    window.removeEventListener('offline', this.onWsClose);
    window.removeEventListener('beforeunload', this.unshareWebcam);

    this.visibility.removeEventListeners();

    // Unshare user webcam
    if (this.sharedWebcam) {
      this.unshareWebcam();
      Session.set('userWasInWebcam', true);
    }

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
      logCode: 'video_provider_onwsclose'
    }, 'Multiple video provider websocket connection closed.');

    clearInterval(this.pingInterval);

    if (this.sharedWebcam) {
      this.unshareWebcam();
    }

    this.setState({ socketOpen: false });
  }

  onWsOpen() {
    logger.debug({
      logCode: 'video_provider_onwsopen'
    }, 'Multiple video provider websocket connection opened.');

    // Resend queued messages that happened when socket was not connected
    while (this.wsQueue.length > 0) {
      this.sendMessage(this.wsQueue.pop());
    }

    this.pingInterval = setInterval(this.ping.bind(this), PING_INTERVAL);

    this.setState({ socketOpen: true });
  }

  sendPauseStream(cameraId, role, state) {
    this.sendMessage({
      id: 'pause',
      type: 'video',
      cameraId,
      role,
      state,
    });
  }

  pauseViewers() {
    logger.debug({
      logCode: 'video_provider_pause_viewers'
    }, 'Calling pause in viewer streams');

    Object.keys(this.webRtcPeers).forEach((cameraId) => {
      const peer = this.webRtcPeers[cameraId];
      const peerStarted = peer && peer.started;
      if (!VideoService.isLocalStream(cameraId) && peerStarted) {
        this.sendPauseStream(cameraId, 'viewer', true);
      }
    });
  }

  unpauseViewers() {
    logger.debug({
      logCode: 'video_provider_unpause_viewers'
    }, 'Calling un-pause in viewer streams');

    Object.keys(this.webRtcPeers).forEach((cameraId) => {
      const peer = this.webRtcPeers[cameraId];
      const peerStarted = peer && peer.started
      if (!VideoService.isLocalStream(cameraId) && peerStarted) {
        this.sendPauseStream(cameraId, 'viewer', false);
      }
    });
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

  startResponse(message) {
    const { cameraId } = message;
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
        VideoProvider.processIceQueue(peer, cameraId);
      });
    } else {
      logger.warn({
        logCode: 'video_provider_startresponse_no_peer'
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
    }, `Multiple video provider received candidate for ${cameraId}: ${JSON.stringify(candidate)}`);

    if (peer) {
      if (peer.didSDPAnswered) {
        VideoProvider.addCandidateToPeer(peer, candidate, cameraId);
      } else {
        // ICE candidates are queued until a SDP answer has been processed.
        // This was done due to a long term iOS/Safari quirk where it'd
        // fail if candidates were added before the offer/answer cycle was completed.
        // Dunno if that still happens, but it works even if it slows the ICE checks
        // a bit  - prlanzarin july 2019
        if (peer.iceQueue == null) {
          peer.iceQueue = [];
        }
        peer.iceQueue.push(candidate);
      }
    } else {
      logger.warn({
        logCode: 'video_provider_addicecandidate_no_peer'
      }, `SFU ICE candidate for ${cameraId} arrived after the peer was discarded, ignore it.`);
    }
  }

  stopWebRTCPeer(cameraId, restarting = false) {
    const isLocal = VideoService.isLocalStream(cameraId);

    // in this case, 'closed' state is not caused by an error;
    // we stop listening to prevent this from being treated as an error
    const peer = this.webRtcPeers[cameraId];
    if (peer && peer.peerConnection) {
      const conn = peer.peerConnection
      conn.oniceconnectionstatechange = null;
    }

    if (isLocal) {
      this.unshareWebcam();
    }

    const role = isLocal ? 'share' : 'viewer';

    logger.info({
      logCode: 'video_provider_stopping_webcam_sfu'
    }, `Sending stop request to SFU. Camera: ${cameraId}, role ${role} and flag restarting ${restarting}`);
    this.sendMessage({
      id: 'stop',
      type: 'video',
      cameraId,
      role,
    });

    // Clear the shared camera media flow timeout when destroying it
    if (!restarting) {
      if (this.restartTimeout[cameraId]) {
        clearTimeout(this.restartTimeout[cameraId]);
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
        logCode: 'video_provider_destroywebrtcpeer'
      }, `Disposing WebRTC peer ${cameraId}`);
      if (typeof peer.dispose === 'function') {
        peer.dispose();
      }
      delete this.webRtcPeers[cameraId];
    } else {
      logger.warn({
        logCode: 'video_provider_destroywebrtcpeer_no_peer'
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
          error,
        },
      }, 'multiple-video-provider failed to fetch STUN/TURN info, using default');
    } finally {
      const { constraints, bitrate, id: profileId } = VideoProvider.getCameraProfile();
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
        this.shareWebcam();
      } else {
        WebRtcPeerObj = window.kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly;
      }

      this.webRtcPeers[cameraId] = new WebRtcPeerObj(peerOptions, (error) => {
        const peer = this.webRtcPeers[cameraId];

        peer.started = false;
        peer.attached = false;
        peer.didSDPAnswered = false;
        if (peer.iceQueue == null) {
          peer.iceQueue = [];
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
            role: isLocal ? 'share' : 'viewer',
            sdpOffer: offerSdp,
            meetingId: this.info.meetingId,
            voiceBridge: this.info.voiceBridge,
            userId: this.info.userId,
            userName: this.info.userName,
            bitrate,
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
        conn.oniceconnectionstatechange = this._getOnIceConnectionStateChangeCallback(cameraId);
      }
    }
  }

  _getWebRTCStartTimeout(cameraId, isLocal) {
    const { intl } = this.props;

    return () => {
      // Peer that timed out is a sharer/publisher
      if (VideoService.isLocalStream(cameraId)) {
        logger.error({
          logCode: 'video_provider_camera_share_timeout',
          extraInfo: { cameraId },
        }, `Camera SHARER has not succeeded in ${CAMERA_SHARE_FAILED_WAIT_TIME} for ${cameraId}`);

        VideoProvider.notifyError(intl.formatMessage(intlClientErrors.mediaFlowTimeout));
        this.stopWebRTCPeer(cameraId, false);
      } else {
        // Create new reconnect interval time
        const oldReconnectTimer = this.restartTimer[cameraId];
        const newReconnectTimer = Math.min(
          2 * oldReconnectTimer[cameraId],
          MAX_CAMERA_SHARE_FAILED_WAIT_TIME,
        );
        this.restartTimer[cameraId] = newReconnectTimer;

        // Peer that timed out is a subscriber/viewer
        // Subscribers try to reconnect according to their timers if media could
        // not reach the server. That's why we pass the restarting flag as true
        // to the stop procedure as to not destroy the timers
        logger.error({
          logCode: 'video_provider_camera_view_timeout',
          extraInfo: {
            cameraId,
          },
        }, `Camera VIEWER has not succeeded in ${oldReconnectTimer} for ${cameraId}. Reconnecting.`);

        this.stopWebRTCPeer(cameraId, true);
        this.createWebRTCPeer(cameraId, isLocal);
      }
    };
  }

  _onWebRTCError(error, cameraId) {
    const { intl } = this.props;

    // 2001 means MEDIA_SERVER_OFFLINE. It's a server-wide error.
    // We only display it to a sharer/publisher instance to avoid popping up
    // redundant toasts.
    // If the client only has viewer instances, the WS will close unexpectedly
    // and an error will be shown there for them.
    if (error === 2001 && !VideoService.isLocalStream(cameraId)) {
      return;
    }

    const errorMessage = intlClientErrors[error.name]
      || intlSFUErrors[error] || intlClientErrors.permissionError;
    VideoProvider.notifyError(intl.formatMessage(errorMessage));
    this.stopWebRTCPeer(cameraId);

    logger.error({
      logCode: 'video_provider_webrtc_peer_error',
      extraInfo: {
        cameraId,
        normalizedError: errorMessage,
        error,
      },
    }, `Camera peer creation failed for ${cameraId} due to ${error.message}`);
  }

  _getOnIceCandidateCallback(cameraId, isLocal) {
    const peer = this.webRtcPeers[cameraId];

    return (candidate) => {
      // Setup a timeout only when ice first is generated and if the peer wasn't
      // marked as started already (which is done on handlePlayStart after
      // it was verified that media could circle through the server)
      const peerStarted = peer && peer.started === true;
      const shouldSetReconnectionTimeout = !this.restartTimeout[cameraId] && !peerStarted;

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

      logger.debug({
        logCode: 'video_provider_client_candidate',
        extraInfo: { candidate },
      }, `multiple-video-provider client-side candidate generated for ${cameraId}: ${JSON.stringify(candidate)}`);
      const message = {
        id: 'onIceCandidate',
        type: 'video',
        cameraId,
        role: isLocal ? 'share' : 'viewer',
        candidate,
      };
      this.sendMessage(message);
    };
  }

  _getOnIceConnectionStateChangeCallback(cameraId) {
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
          VideoProvider.notifyError(intl.formatMessage(intlClientErrors.iceConnectionStateError));
        }
      };
    } else {
      return () => {
        logger.error({
          logCode: 'video_provider_ice_connection_failed_state',
          extraInfo: {
            cameraId,
            iceConnectionState: undefined,
          },
        }, `Missing peer at ICE connection state transition for ${cameraId}`);

        this.stopWebRTCPeer(cameraId);
      };
    }
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
    this.stopWebRTCPeer(cameraId);
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

    if (VideoService.isLocalStream(cameraId)) {
      this.unshareWebcam();
      VideoProvider.notifyError(intl.formatMessage(intlSFUErrors[code] || intlSFUErrors[2200]));
    } else {
      this.stopWebRTCPeer(cameraId);
    }
  }

  shareWebcam() {
    if (this.connectedToMediaServer()) {
      logger.info({ logCode: 'video_provider_sharewebcam' }, 'Sharing webcam');
      this.sharedWebcam = true;
      VideoService.joiningVideo();
    }
  }

  unshareWebcam() {
    logger.info({ logCode: 'video_provider_unsharewebcam' }, 'Sending unshare webcam notification to meteor');

    VideoService.sendUserUnshareWebcam(this.info.userId);
    VideoService.exitedVideo();
    this.sharedWebcam = false;
  }

  render() {
    const { swapLayout } = this.props;
    const { socketOpen } = this.state;
    if (!socketOpen) return null;

    const {
      users,
    } = this.props;
    return (
      <VideoList
        users={users}
        onMount={this.createVideoTag}
        swapLayout={swapLayout}
      />
    );
  }
}

VideoProvider.propTypes = propTypes;

export default injectIntl(VideoProvider);

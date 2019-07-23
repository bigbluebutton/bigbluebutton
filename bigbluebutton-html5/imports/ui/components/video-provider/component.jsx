import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { Session } from 'meteor/session';
import { notify } from '/imports/ui/services/notification';
import VisibilityEvent from '/imports/utils/visibilityEvent';
import { fetchWebRTCMappedStunTurnServers } from '/imports/utils/fetchStunTurnServers';
import ReconnectingWebSocket from 'reconnecting-websocket';
import logger from '/imports/startup/client/logger';
import browser from 'browser-detect';
import {
  updateCurrentWebcamsConnection,
  getCurrentWebcams,
  deleteWebcamConnection,
  newWebcamConnection,
  updateWebcamStats,
} from '/imports/ui/services/network-information/index';
import { tryGenerateIceCandidates } from '../../../utils/safari-webrtc';
import Auth from '/imports/ui/services/auth';

import VideoService from './service';
import VideoList from './video-list/component';

const ENABLE_NETWORK_MONITORING = Meteor.settings.public.networkMonitoring.enableNetworkMonitoring;
const CAMERA_PROFILES = Meteor.settings.public.kurento.cameraProfiles;

const intlClientErrors = defineMessages({
  iceCandidateError: {
    id: 'app.video.iceCandidateError',
    description: 'Error message for ice candidate fail',
  },
  chromeExtensionError: {
    id: 'app.video.chromeExtensionError',
    description: 'Error message for Chrome Extension not installed',
  },
  chromeExtensionErrorLink: {
    id: 'app.video.chromeExtensionErrorLink',
    description: 'Error message for Chrome Extension not installed',
  },
  permissionError: {
    id: 'app.video.permissionError',
    description: 'Error message for webcam permission',
  },
  NotFoundError: {
    id: 'app.video.notFoundError',
    description: 'error message when can not get webcam video',
  },
  NotAllowedError: {
    id: 'app.video.notAllowed',
    description: 'error message when webcam had permission denied',
  },
  NotSupportedError: {
    id: 'app.video.notSupportedError',
    description: 'error message when origin do not have ssl valid',
  },
  NotReadableError: {
    id: 'app.video.notReadableError',
    description: 'error message When the webcam is being used by other software',
  },
  iceConnectionStateError: {
    id: 'app.video.iceConnectionStateError',
    description: 'Error message for ice connection state being failed',
  },
  mediaFlowTimeout: {
    id: 'app.video.mediaFlowTimeout1020',
    description: 'Error message when media could not go through the server within the specified period',
  },
});

const intlSFUErrors = defineMessages({
  2000: {
    id: 'app.sfu.mediaServerConnectionError2000',
    description: 'Error message fired when the SFU cannot connect to the media server',
  },
  2001: {
    id: 'app.sfu.mediaServerOffline2001',
    description: 'error message when SFU is offline',
  },
  2002: {
    id: 'app.sfu.mediaServerNoResources2002',
    description: 'Error message fired when the media server lacks disk, CPU or FDs',
  },
  2003: {
    id: 'app.sfu.mediaServerRequestTimeout2003',
    description: 'Error message fired when requests are timing out due to lack of resources',
  },
  2021: {
    id: 'app.sfu.serverIceGatheringFailed2021',
    description: 'Error message fired when the server cannot enact ICE gathering',
  },
  2022: {
    id: 'app.sfu.serverIceStateFailed2022',
    description: 'Error message fired when the server endpoint transitioned to a FAILED ICE state',
  },
  2200: {
    id: 'app.sfu.mediaGenericError2200',
    description: 'Error message fired when the SFU component generated a generic error',
  },
  2202: {
    id: 'app.sfu.invalidSdp2202',
    description: 'Error message fired when the clients provides an invalid SDP',
  },
  2203: {
    id: 'app.sfu.noAvailableCodec2203',
    description: 'Error message fired when the server has no available codec for the client',
  },
});

const CAMERA_SHARE_FAILED_WAIT_TIME = 15000;
const MAX_CAMERA_SHARE_FAILED_WAIT_TIME = 60000;
const PING_INTERVAL = 15000;

class VideoProvider extends Component {
  static notifyError(message) {
    notify(message, 'error', 'video');
  }

  constructor(props) {
    super(props);

    this.state = {
      socketOpen: false,
      stats: [],
    };

    // Set a valid bbb-webrtc-sfu application server socket in the settings
    this.ws = new ReconnectingWebSocket(Auth.authenticateURL(Meteor.settings.public.kurento.wsUrl));
    this.wsQueue = [];

    this.visibility = new VisibilityEvent();

    this.restartTimeout = {};
    this.restartTimer = {};
    this.webRtcPeers = {};
    this.monitoredTracks = {};
    this.videoTags = {};
    this.sharedWebcam = false;

    this.createVideoTag = this.createVideoTag.bind(this);
    this.getStats = this.getStats.bind(this);
    this.stopGettingStats = this.stopGettingStats.bind(this);
    this.onWsOpen = this.onWsOpen.bind(this);
    this.onWsClose = this.onWsClose.bind(this);
    this.onWsMessage = this.onWsMessage.bind(this);

    this.unshareWebcam = this.unshareWebcam.bind(this);
    this.shareWebcam = this.shareWebcam.bind(this);

    this.pauseViewers = this.pauseViewers.bind(this);
    this.unpauseViewers = this.unpauseViewers.bind(this);

    this.customGetStats = this.customGetStats.bind(this);
  }


  componentWillMount() {
    this.ws.onopen = this.onWsOpen;
    this.ws.onclose = this.onWsClose;

    window.addEventListener('online', this.openWs);
    window.addEventListener('offline', this.onWsClose);
  }

  componentDidMount() {
    this.checkIceConnectivity();
    document.addEventListener('joinVideo', this.shareWebcam); // TODO find a better way to do this
    document.addEventListener('exitVideo', this.unshareWebcam);
    this.ws.onmessage = this.onWsMessage;
    window.addEventListener('beforeunload', this.unshareWebcam);

    this.visibility.onVisible(this.unpauseViewers);
    this.visibility.onHidden(this.pauseViewers);

    if (ENABLE_NETWORK_MONITORING) {
      this.currentWebcamsStatsInterval = setInterval(() => {
        const currentWebcams = getCurrentWebcams();
        if (!currentWebcams) return;

        const { payload } = currentWebcams;

        payload.forEach((id) => {
          const peer = this.webRtcPeers[id];

          const hasLocalStream = peer && peer.started === true
            && peer.peerConnection.getLocalStreams().length > 0;
          const hasRemoteStream = peer && peer.started === true
            && peer.peerConnection.getRemoteStreams().length > 0;

          if (hasLocalStream) {
            this.customGetStats(peer.peerConnection,
              peer.peerConnection.getLocalStreams()[0].getVideoTracks()[0],
              (stats => updateWebcamStats(id, stats)), true);
          } else if (hasRemoteStream) {
            this.customGetStats(peer.peerConnection,
              peer.peerConnection.getRemoteStreams()[0].getVideoTracks()[0],
              (stats => updateWebcamStats(id, stats)), true);
          }
        });
      }, 5000);
    }
  }

  componentWillUpdate({ users, userId }) {
    const usersSharingIds = users.map(u => u.id);
    const usersConnected = Object.keys(this.webRtcPeers);

    const usersToConnect = usersSharingIds.filter(id => !usersConnected.includes(id));
    const usersToDisconnect = usersConnected.filter(id => !usersSharingIds.includes(id));

    usersToConnect.forEach(id => this.createWebRTCPeer(id, userId === id));
    usersToDisconnect.forEach(id => this.stopWebRTCPeer(id));
  }

  componentDidUpdate(prevProps) {
    const { users } = this.props;
    if (users.length !== prevProps.users.length) window.dispatchEvent(new Event('videoListUsersChange'));
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

    Object.keys(this.webRtcPeers).forEach((id) => {
      this.stopGettingStats(id);
      this.stopWebRTCPeer(id);
    });

    clearInterval(this.currentWebcamsStatsInterval);

    // Close websocket connection to prevent multiple reconnects from happening
    this.ws.close();
  }

  onWsMessage(msg) {
    const parsedMessage = JSON.parse(msg.data);

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
    logger.debug({ logCode: 'video_provider_onwsclose' },
      'video-provider websocket connection closed.');

    clearInterval(this.pingInterval);

    if (this.sharedWebcam) {
      this.unshareWebcam();
    }

    this.setState({ socketOpen: false });
  }

  onWsOpen() {
    logger.debug({ logCode: 'video_provider_onwsopen' },
      'video-provider websocket connection opened.');

    // -- Resend queued messages that happened when socket was not connected
    while (this.wsQueue.length > 0) {
      this.sendMessage(this.wsQueue.pop());
    }

    this.pingInterval = setInterval(this.ping.bind(this), PING_INTERVAL);

    this.setState({ socketOpen: true });
  }

  getStats(id, video, callback) {
    const peer = this.webRtcPeers[id];

    const hasLocalStream = peer && peer.started === true
      && peer.peerConnection.getLocalStreams().length > 0;
    const hasRemoteStream = peer && peer.started === true
      && peer.peerConnection.getRemoteStreams().length > 0;

    if (hasLocalStream) {
      this.monitorTrackStart(peer.peerConnection,
        peer.peerConnection.getLocalStreams()[0].getVideoTracks()[0], true, callback);
    } else if (hasRemoteStream) {
      this.monitorTrackStart(peer.peerConnection,
        peer.peerConnection.getRemoteStreams()[0].getVideoTracks()[0], false, callback);
    }
  }

  checkIceConnectivity() {
    // Webkit ICE restrictions demand a capture device permission to release
    // host candidates
    if (browser().name === 'safari') {
      const { intl } = this.props;
      tryGenerateIceCandidates().catch(() => {
        VideoProvider.notifyError(intl.formatMessage(intlSFUErrors[2021]));
      });
    }
  }

  _sendPauseStream(id, role, state) {
    this.sendMessage({
      cameraId: id,
      id: 'pause',
      type: 'video',
      role,
      state,
    });
  }

  pauseViewers() {
    const { userId } = this.props;
    logger.debug({ logCode: 'video_provider_pause_viewers' }, 'Calling pause in viewer streams');

    Object.keys(this.webRtcPeers).forEach((id) => {
      if (userId !== id && this.webRtcPeers[id] && this.webRtcPeers[id].started) {
        this._sendPauseStream(id, 'viewer', true);
      }
    });
  }

  unpauseViewers() {
    const { userId } = this.props;
    logger.debug({ logCode: 'video_provider_unpause_viewers' }, 'Calling un-pause in viewer streams');

    Object.keys(this.webRtcPeers).forEach((id) => {
      if (id !== userId && this.webRtcPeers[id] && this.webRtcPeers[id].started) {
        this._sendPauseStream(id, 'viewer', false);
      }
    });
  }

  ping() {
    const message = {
      id: 'ping',
    };
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
              error,
              sfuRequest: message,
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
    const id = message.cameraId;
    const peer = this.webRtcPeers[id];

    logger.info({
      logCode: 'video_provider_start_response_success',
      extraInfo: {
        sfuResponse: message,
        cameraId: id,
      },
    }, `Camera start request was accepted by SFU, processing response for ${id}`);

    if (peer) {
      peer.processAnswer(message.sdpAnswer, (error) => {
        if (error) {
          logger.error({
            logCode: 'video_provider_peerconnection_processanswer_error',
            extraInfo: {
              error,
              cameraId: id,
            },
          }, `Processing SDP answer from SFU for ${id} failed due to ${error.message}`);

          return;
        }

        peer.didSDPAnswered = true;
        this._processIceQueue(peer, id);
      });
    } else {
      logger.warn({ logCode: 'video_provider_startresponse_no_peer' },
        `SFU start response for ${id} arrived after the peer was discarded, ignore it.`);
    }
  }

  addCandidateToPeer(peer, candidate, cameraId) {
    peer.addIceCandidate(candidate, (error) => {
      if (error) {
        // Just log the error. We can't be sure if a candidate failure on add is
        // fatal or not, so that's why we have a timeout set up for negotiations and
        // listeners for ICE state transitioning to failures, so we won't act on it here
        logger.error({
          logCode: 'video_provider_addicecandidate_error',
          extraInfo: {
            error,
            cameraId,
          },
        }, `Adding ICE candidate failed for ${cameraId} due to ${error.message}`);
      }
    });
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
        this.addCandidateToPeer(peer, candidate, cameraId);
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
      logger.warn({ logCode: 'video_provider_addicecandidate_no_peer' },
        `SFU ICE candidate for ${cameraId} arrived after the peer was discarded, ignore it.`);
    }
  }

  stopWebRTCPeer(id, restarting = false) {
    const { userId } = this.props;
    const shareWebcam = id === userId;

    // in this case, 'closed' state is not caused by an error;
    // we stop listening to prevent this from being treated as an error
    if (this.webRtcPeers[id] && this.webRtcPeers[id].peerConnection) {
      this.webRtcPeers[id].peerConnection.oniceconnectionstatechange = null;
    }

    if (shareWebcam) {
      this.unshareWebcam();
    }

    const role = shareWebcam ? 'share' : 'viewer';

    logger.info({ logCode: 'video_provider_stopping_webcam_sfu' },
      `Sending stop request to SFU. Camera: ${id}, role ${role} and flag restarting ${restarting}`);
    this.sendMessage({
      type: 'video',
      role,
      id: 'stop',
      cameraId: id,
    });

    // Clear the shared camera media flow timeout when destroying it
    if (!restarting) {
      if (this.restartTimeout[id]) {
        clearTimeout(this.restartTimeout[id]);
      }

      if (this.restartTimer[id]) {
        delete this.restartTimer[id];
      }
    }

    this.destroyWebRTCPeer(id);
  }

  destroyWebRTCPeer(id) {
    const webRtcPeer = this.webRtcPeers[id];
    if (webRtcPeer) {
      logger.info({ logCode: 'video_provider_destroywebrtcpeer' }, `Disposing WebRTC peer ${id}`);
      if (typeof webRtcPeer.dispose === 'function') {
        webRtcPeer.dispose();
      }
      delete this.webRtcPeers[id];
      if (ENABLE_NETWORK_MONITORING) {
        deleteWebcamConnection(id);
        updateCurrentWebcamsConnection(this.webRtcPeers);
      }
    } else {
      logger.warn({ logCode: 'video_provider_destroywebrtcpeer_no_peer' },
        `Peer ${id} was already disposed (glare), ignore it.`);
    }
  }

  getCameraProfile() {
    const profileId = Session.get('WebcamProfileId') || '';
    const cameraProfile = CAMERA_PROFILES.find(profile => profile.id === profileId)
      || CAMERA_PROFILES.find(profile => profile.default)
      || CAMERA_PROFILES[0];
    if (Session.get('WebcamDeviceId')) {
      cameraProfile.constraints.deviceId = { exact: Session.get('WebcamDeviceId') };
    }

    return cameraProfile;
  }

  async createWebRTCPeer(id, shareWebcam) {
    const { meetingId, sessionToken, voiceBridge } = this.props;
    let iceServers = [];

    // Check if the peer is already being processed
    if (this.webRtcPeers[id]) {
      return;
    }

    this.webRtcPeers[id] = {};

    try {
      iceServers = await fetchWebRTCMappedStunTurnServers(sessionToken);
    } catch (error) {
      logger.error({
        logCode: 'video_provider_fetchstunturninfo_error',
        extraInfo: {
          error,
        },
      }, 'video-provider failed to fetch STUN/TURN info, using default');
    } finally {
      const { constraints, bitrate, id: profileId } = this.getCameraProfile();
      const peerOptions = {
        mediaConstraints: {
          audio: false,
          video: constraints,
        },
        onicecandidate: this._getOnIceCandidateCallback(id, shareWebcam),
      };

      if (iceServers.length > 0) {
        peerOptions.configuration = {};
        peerOptions.configuration.iceServers = iceServers;
      }

      let WebRtcPeerObj;
      if (shareWebcam) {
        WebRtcPeerObj = window.kurentoUtils.WebRtcPeer.WebRtcPeerSendonly;
        this.shareWebcam();
      } else {
        WebRtcPeerObj = window.kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly;
      }

      this.webRtcPeers[id] = new WebRtcPeerObj(peerOptions, (error) => {
        const peer = this.webRtcPeers[id];

        peer.started = false;
        peer.attached = false;
        peer.didSDPAnswered = false;
        if (peer.iceQueue == null) {
          peer.iceQueue = [];
        }

        if (error) {
          return this._onWebRTCError(error, id, shareWebcam);
        }

        peer.generateOffer((errorGenOffer, offerSdp) => {
          if (errorGenOffer) {
            return this._onWebRTCError(errorGenOffer, id, shareWebcam);
          }

          const message = {
            type: 'video',
            role: shareWebcam ? 'share' : 'viewer',
            id: 'start',
            sdpOffer: offerSdp,
            cameraId: id,
            meetingId,
            voiceBridge,
            bitrate,
          };

          logger.info({
            logCode: 'video_provider_sfu_request_start_camera',
            extraInfo: {
              sfuRequest: message,
              cameraProfile: profileId,
            },
          }, `Camera offer generated. Sending start request to SFU for ${id}`);

          this.sendMessage(message);
        });
      });
      if (this.webRtcPeers[id].peerConnection) {
        this.webRtcPeers[id]
          .peerConnection
          .oniceconnectionstatechange = this._getOnIceConnectionStateChangeCallback(id);
      }
      if (ENABLE_NETWORK_MONITORING) {
        newWebcamConnection(id);
        updateCurrentWebcamsConnection(this.webRtcPeers);
      }
    }
  }

  _getWebRTCStartTimeout(id, shareWebcam) {
    const { intl, userId } = this.props;

    return () => {
      // Peer that timed out is a sharer/publisher
      if (userId === id) {
        logger.error({
          logCode: 'video_provider_camera_share_timeout',
          extraInfo: {
            cameraId: id,
          },
        }, `Camera SHARER has not succeeded in ${CAMERA_SHARE_FAILED_WAIT_TIME} for ${id}`);
        VideoProvider.notifyError(intl.formatMessage(intlClientErrors.mediaFlowTimeout));
        this.stopWebRTCPeer(id, false);
      } else {
        // Create new reconnect interval time
        const oldReconnectTimer = this.restartTimer[id];
        const newReconnectTimer = Math.min(
          2 * oldReconnectTimer[id],
          MAX_CAMERA_SHARE_FAILED_WAIT_TIME,
        );
        this.restartTimer[id] = newReconnectTimer;

        // Peer that timed out is a subscriber/viewer
        // Subscribers try to reconnect according to their timers if media could
        // not reach the server. That's why we pass the restarting flag as true
        // to the stop procedure as to not destroy the timers
        logger.error({
          logCode: 'video_provider_camera_view_timeout',
          extraInfo: {
            cameraId: id,
          },
        }, `Camera VIEWER has not succeeded in ${oldReconnectTimer} for ${id}. Reconnecting.`);
        this.stopWebRTCPeer(id, true);
        this.createWebRTCPeer(id, shareWebcam);
      }
    };
  }

  _processIceQueue(peer, cameraId) {
    while (peer.iceQueue.length) {
      const candidate = peer.iceQueue.shift();
      this.addCandidateToPeer(peer, candidate, cameraId);
    }
  }

  _onWebRTCError(error, cameraId) {
    const { intl, userId } = this.props;

    // 2001 means MEDIA_SERVER_OFFLINE. It's a server-wide error.
    // We only display it to a sharer/publisher instance to avoid popping up
    // redundant toasts.
    // If the client only has viewer instances, the WS will close unexpectedly
    // and an error will be shown there for them.
    if (error === 2001 && userId !== cameraId) {
      return;
    }

    const errorMessage = intlClientErrors[error.name]
      || intlSFUErrors[error] || intlClientErrors.permissionError;
    VideoProvider.notifyError(intl.formatMessage(errorMessage));
    this.stopWebRTCPeer(cameraId);

    logger.error({
      logCode: 'video_provider_webrtc_peer_error',
      extraInfo: {
        error,
        normalizedError: errorMessage,
        cameraId,
      },
    }, `Camera peer creation failed for ${cameraId} due to ${error.message}`);
  }

  _getOnIceCandidateCallback(id, shareWebcam) {
    const peer = this.webRtcPeers[id];

    return (candidate) => {
      // Setup a timeout only when ice first is generated and if the peer wasn't
      // marked as started already (which is done on handlePlayStart after
      // it was verified that media could circle through the server)
      const peerHasStarted = peer && peer.started === true;
      const shouldSetReconnectionTimeout = !this.restartTimeout[id] && !peerHasStarted;

      if (shouldSetReconnectionTimeout) {
        const newReconnectTimer = this.restartTimer[id] || CAMERA_SHARE_FAILED_WAIT_TIME;
        this.restartTimer[id] = newReconnectTimer;

        logger.info({
          logCode: 'video_provider_setup_reconnect',
          extraInfo: {
            cameraId: id,
            reconnectTimer: newReconnectTimer,
          },
        }, `Camera has a new reconnect timer of ${newReconnectTimer} ms for ${id}`);
        this.restartTimeout[id] = setTimeout(this._getWebRTCStartTimeout(id, shareWebcam),
          this.restartTimer[id]);
      }

      logger.debug({
        logCode: 'video_provider_client_candidate',
        extraInfo: { candidate },
      }, `video-provider client-side candidate generated for ${id}: ${JSON.stringify(candidate)}`);
      const message = {
        type: 'video',
        role: shareWebcam ? 'share' : 'viewer',
        id: 'onIceCandidate',
        candidate,
        cameraId: id,
      };
      this.sendMessage(message);
    };
  }

  _getOnIceConnectionStateChangeCallback(id) {
    const { intl } = this.props;
    const peer = this.webRtcPeers[id];

    return () => {
      const { iceConnectionState } = peer.peerConnection;
      if (iceConnectionState === 'failed' || iceConnectionState === 'closed') {
        // prevent the same error from being detected multiple times
        peer.peerConnection.oniceconnectionstatechange = null;
        logger.error({
          logCode: 'video_provider_ice_connection_failed_state',
          extraInfo: {
            cameraId: id,
            iceConnectionState,
          },
        }, `ICE connection state transitioned to ${iceConnectionState} for ${id}`);

        this.stopWebRTCPeer(id);
        VideoProvider.notifyError(intl.formatMessage(intlClientErrors.iceConnectionStateError));
      }
    };
  }

  attachVideoStream(id) {
    const { userId } = this.props;
    const video = this.videoTags[id];
    if (video == null) {
      logger.warn({
        logCode: 'video_provider_delay_attach_video_stream',
        extraInfo: {
          cameraId: id,
        },
      }, `Will attach stream later because camera has not started yet for ${id}`);
      return;
    }

    if (video.srcObject) {
      delete this.videoTags[id];
      return; // Skip if the stream is already attached
    }

    const isCurrent = id === userId;
    const peer = this.webRtcPeers[id];

    const attachVideoStreamHelper = () => {
      const stream = isCurrent ? peer.getLocalStream() : peer.getRemoteStream();
      video.pause();
      video.srcObject = stream;
      video.load();

      peer.attached = true;
      delete this.videoTags[id];
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

  createVideoTag(id, video) {
    const peer = this.webRtcPeers[id];
    this.videoTags[id] = video;

    if (peer) {
      this.attachVideoStream(id);
    }
  }

  customGetStats(peer, mediaStreamTrack, callback, monitoring = false) {
    const { stats } = this.state;
    const statsState = stats;
    let promise;
    try {
      promise = peer.getStats(mediaStreamTrack);
    } catch (e) {
      promise = Promise.reject(e);
    }
    promise.then((results) => {
      let videoInOrOutbound = {};
      results.forEach((res) => {
        if (res.type === 'ssrc' || res.type === 'inbound-rtp' || res.type === 'outbound-rtp') {
          res.packetsSent = parseInt(res.packetsSent, 10);
          res.packetsLost = parseInt(res.packetsLost, 10) || 0;
          res.packetsReceived = parseInt(res.packetsReceived, 10);

          if ((Number.isNaN(res.packetsSent) && res.packetsReceived === 0)
            || (res.type === 'outbound-rtp' && res.isRemote)) {
            return; // Discard local video receiving
          }

          if (res.googFrameWidthReceived) {
            res.width = parseInt(res.googFrameWidthReceived, 10);
            res.height = parseInt(res.googFrameHeightReceived, 10);
          } else if (res.googFrameWidthSent) {
            res.width = parseInt(res.googFrameWidthSent, 10);
            res.height = parseInt(res.googFrameHeightSent, 10);
          }

          // Extra fields available on Chrome
          if (res.googCodecName) res.codec = res.googCodecName;
          if (res.googDecodeMs) res.decodeDelay = res.googDecodeMs;
          if (res.googEncodeUsagePercent) res.encodeUsagePercent = res.googEncodeUsagePercent;
          if (res.googRtt) res.rtt = res.googRtt;
          if (res.googCurrentDelayMs) res.currentDelay = res.googCurrentDelayMs;

          videoInOrOutbound = res;
        }
      });

      const videoStats = {
        timestamp: videoInOrOutbound.timestamp,
        bytesReceived: videoInOrOutbound.bytesReceived,
        bytesSent: videoInOrOutbound.bytesSent,
        packetsReceived: videoInOrOutbound.packetsReceived,
        packetsLost: videoInOrOutbound.packetsLost,
        packetsSent: videoInOrOutbound.packetsSent,
        decodeDelay: videoInOrOutbound.decodeDelay,
        codec: videoInOrOutbound.codec,
        height: videoInOrOutbound.height,
        width: videoInOrOutbound.width,
        encodeUsagePercent: videoInOrOutbound.encodeUsagePercent,
        rtt: videoInOrOutbound.rtt,
        currentDelay: videoInOrOutbound.currentDelay,
        pliCount: videoInOrOutbound.pliCount,
      };

      const videoStatsArray = statsState;
      videoStatsArray.push(videoStats);
      while (videoStatsArray.length > 5) { // maximum interval to consider
        videoStatsArray.shift();
      }

      if (!monitoring) {
        this.setState({ stats: videoStatsArray });
      }

      const firstVideoStats = videoStatsArray[0];
      const lastVideoStats = videoStatsArray[videoStatsArray.length - 1];

      const videoIntervalPacketsLost = lastVideoStats.packetsLost - firstVideoStats.packetsLost;
      const videoIntervalPacketsReceived = lastVideoStats
        .packetsReceived - firstVideoStats.packetsReceived;
      const videoIntervalPacketsSent = lastVideoStats.packetsSent - firstVideoStats.packetsSent;
      const videoIntervalBytesReceived = lastVideoStats
        .bytesReceived - firstVideoStats.bytesReceived;
      const videoIntervalBytesSent = lastVideoStats.bytesSent - firstVideoStats.bytesSent;

      const videoReceivedInterval = lastVideoStats.timestamp - firstVideoStats.timestamp;
      const videoSentInterval = lastVideoStats.timestamp - firstVideoStats.timestamp;

      const videoKbitsReceivedPerSecond = (videoIntervalBytesReceived * 8) / videoReceivedInterval;
      const videoKbitsSentPerSecond = (videoIntervalBytesSent * 8) / videoSentInterval;

      let videoLostPercentage;


      let videoLostRecentPercentage;


      let videoBitrate;
      if (videoStats.packetsReceived > 0) { // Remote video
        videoLostPercentage = ((videoStats.packetsLost / (
          (videoStats.packetsLost + videoStats.packetsReceived) * 100
        )) || 0).toFixed(1);
        videoBitrate = Math.floor(videoKbitsReceivedPerSecond || 0);
        videoLostRecentPercentage = ((videoIntervalPacketsLost / ((videoIntervalPacketsLost
          + videoIntervalPacketsReceived) * 100)) || 0).toFixed(1);
      } else {
        videoLostPercentage = (((videoStats.packetsLost / (videoStats.packetsLost
          + videoStats.packetsSent)) * 100) || 0).toFixed(1);
        videoBitrate = Math.floor(videoKbitsSentPerSecond || 0);
        videoLostRecentPercentage = ((videoIntervalPacketsLost / ((videoIntervalPacketsLost
          + videoIntervalPacketsSent) * 100)) || 0).toFixed(1);
      }

      const result = {
        video: {
          bytesReceived: videoStats.bytesReceived,
          bytesSent: videoStats.bytesSent,
          packetsLost: videoStats.packetsLost,
          packetsReceived: videoStats.packetsReceived,
          packetsSent: videoStats.packetsSent,
          bitrate: videoBitrate,
          lostPercentage: videoLostPercentage,
          lostRecentPercentage: videoLostRecentPercentage,
          height: videoStats.height,
          width: videoStats.width,
          codec: videoStats.codec,
          decodeDelay: videoStats.decodeDelay,
          encodeUsagePercent: videoStats.encodeUsagePercent,
          rtt: videoStats.rtt,
          currentDelay: videoStats.currentDelay,
          pliCount: videoStats.pliCount,
        },
      };

      callback(result);
    }, (exception) => {
      logger.error({
        logCode: 'video_provider_get_stats_exception',
        extraInfo: {
          exception,
        },
      }, 'customGetStats() Promise rejected');

      callback(null);
    });
  }

  monitorTrackStart(peer, track, local, callback) {
    const that = this;
    logger.info({
      logCode: 'video_provider_monitor_track_start',
      extraInfo: {
        cameraId: track.id,
      },
    }, 'Starting stats monitoring.');
    const getStatsInterval = 2000;

    const callGetStats = () => {
      that.customGetStats(
        peer,
        track,
        (results) => {
          if (results == null || peer.signalingState === 'closed') {
            that.monitorTrackStop(track.id);
          } else {
            callback(results);
          }
        },
        getStatsInterval,
      );
    };

    if (!this.monitoredTracks[track.id]) {
      callGetStats();
      this.monitoredTracks[track.id] = setInterval(
        callGetStats,
        getStatsInterval,
      );
    } else {
      logger.warn({
        logCode: 'video_provider_already_monitoring_track',
      }, 'Already monitoring this track');
    }
  }

  monitorTrackStop(trackId) {
    if (this.monitoredTracks[trackId]) {
      clearInterval(this.monitoredTracks[trackId]);
      delete this.monitoredTracks[trackId];
      logger.debug({
        logCode: 'video_provider_stop_monitoring',
        extraInfo: {
          trackId,
        },
      }, `Stop monitoring track ${trackId}`);
    } else {
      logger.debug({
        logCode: 'video_provider_already_stopped_monitoring',
        extraInfo: {
          trackId,
        },
      }, `Track ${trackId} is not monitored`);
    }
  }

  stopGettingStats(id) {
    const peer = this.webRtcPeers[id];

    const hasLocalStream = peer && peer.started === true
      && peer.peerConnection.getLocalStreams().length > 0;
    const hasRemoteStream = peer && peer.started === true
      && peer.peerConnection.getRemoteStreams().length > 0;

    if (hasLocalStream) {
      this.monitorTrackStop(peer.peerConnection.getLocalStreams()[0].getVideoTracks()[0].id);
    } else if (hasRemoteStream) {
      this.monitorTrackStop(peer.peerConnection.getRemoteStreams()[0].getVideoTracks()[0].id);
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
      const { userId } = this.props;
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

      if (cameraId === userId) {
        VideoService.sendUserShareWebcam(cameraId);
        VideoService.joinedVideo();
      }
    } else {
      logger.warn({ logCode: 'video_provider_playstart_no_peer' },
        `SFU playStart response for ${cameraId} arrived after the peer was discarded, ignore it.`);
    }
  }

  handleSFUError(message) {
    const { intl } = this.props;
    const { userId } = this.props;
    const { code, reason } = message;
    logger.error({
      logCode: 'video_provider_handle_sfu_error',
      extraInfo: {
        error: message,
        cameraId: message.streamId,
      },
    }, `SFU returned error for camera ${message.streamId}. Code: ${code}, reason: ${reason}`);

    if (message.streamId === userId) {
      this.unshareWebcam();
      VideoProvider.notifyError(intl.formatMessage(intlSFUErrors[code]
        || intlSFUErrors[2200]));
    } else {
      this.stopWebRTCPeer(message.streamId);
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
    const { userId } = this.props;
    logger.info({ logCode: 'video_provider_unsharewebcam' }, 'Sending unshare webcam notification to meteor');

    VideoService.sendUserUnshareWebcam(userId);
    VideoService.exitedVideo();
    this.sharedWebcam = false;
  }

  render() {
    const { socketOpen } = this.state;
    if (!socketOpen) return null;

    const {
      users,
      enableVideoStats,
      mediaHeight,
    } = this.props;
    return (
      <VideoList
        mediaHeight={mediaHeight}
        users={users}
        onMount={this.createVideoTag}
        getStats={this.getStats}
        stopGettingStats={this.stopGettingStats}
        enableVideoStats={enableVideoStats}
      />
    );
  }
}

export default injectIntl(VideoProvider);

import React, { Component } from 'react';
import { styles } from './styles';
import { defineMessages, injectIntl } from 'react-intl';
import { log } from '/imports/ui/services/api';
import { notify } from '/imports/ui/services/notification';
import { toast } from 'react-toastify';
import VisibilityEvent from '/imports/utils/visibilityEvent';
import Toast from '/imports/ui/components/toast/component';
import _ from 'lodash';

import VideoService from './service';
import VideoList from './video-list/component';

const intlMessages = defineMessages({
  iceCandidateError: {
    id: 'app.video.iceCandidateError',
    description: 'Error message for ice candidate fail',
  },
  permissionError: {
    id: 'app.video.permissionError',
    description: 'Error message for webcam permission',
  },
  sharingError: {
    id: 'app.video.sharingError',
    description: 'Error on sharing webcam',
  },
  chromeExtensionError: {
    id: 'app.video.chromeExtensionError',
    description: 'Error message for Chrome Extension not installed',
  },
  chromeExtensionErrorLink: {
    id: 'app.video.chromeExtensionErrorLink',
    description: 'Error message for Chrome Extension not installed',
  },
});

const intlMediaErrorsMessages = defineMessages({
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
  1000: {
    id: 'app.video.mediaServerOffline',
    description: 'error message when kurento is offline',
  },
});

const CAMERA_SHARE_FAILED_WAIT_TIME = 15000;
const MAX_CAMERA_SHARE_FAILED_WAIT_TIME = 60000;
const PING_INTERVAL = 15000;

class VideoProvider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sharedWebcam: false,
      socketOpen: false,
    };

    // Set a valid bbb-webrtc-sfu application server socket in the settings
    this.ws = new ReconnectingWebSocket(Meteor.settings.public.kurento.wsUrl);
    this.wsQueue = [];

    this.visibility = new VisibilityEvent();

    this.restartTimeout = {};
    this.restartTimer = {};
    this.webRtcPeers = {};

    this.openWs = this.ws.open.bind(this.ws);
    this.onWsOpen = this.onWsOpen.bind(this);
    this.onWsClose = this.onWsClose.bind(this);
    this.onWsMessage = this.onWsMessage.bind(this);

    this.unshareWebcam = this.unshareWebcam.bind(this);
    this.shareWebcam = this.shareWebcam.bind(this);

    this.pauseViewers = this.pauseViewers.bind(this);
    this.unpauseViewers = this.unpauseViewers.bind(this);
  }

  _sendPauseStream (id, role, state) {
    this.sendMessage({
      cameraId: id,
      id: 'pause',
      type: 'video',
      role,
      state,
    });
  }

  pauseViewers () {
    log("debug", "Calling pause in viewer streams");


    Object.keys(this.webRtcPeers).forEach((id) => {
      if (this.props.userId !== id && this.webRtcPeers[id].started) {
        this._sendPauseStream(id, 'viewer', true);
      }
    });
  }

  unpauseViewers () {
    log("debug", "Calling un-pause in viewer streams");

    Object.keys(this.webRtcPeers).forEach((id) => {
      if (id !== this.props.userId && this.webRtcPeers[id].started) {
        this._sendPauseStream(id, 'viewer', false);
      }
    });
  }

  componentWillMount() {
    this.ws.addEventListener('open', this.onWsOpen);
    this.ws.addEventListener('close', this.onWsClose);

    window.addEventListener('online', this.openWs);
    window.addEventListener('offline', this.onWsClose);
  }

  componentDidMount() {
    document.addEventListener('joinVideo', this.shareWebcam); // TODO find a better way to do this
    document.addEventListener('exitVideo', this.unshareWebcam);
    this.ws.addEventListener('message', this.onWsMessage);

    this.visibility.onVisible(this.unpauseViewers);
    this.visibility.onHidden(this.pauseViewers);
  }

  shouldComponentUpdate({ users: nextUsers }, nextState) {
    const { users } = this.props;
    return !_.isEqual(this.state, nextState) || users.length !== nextUsers.length;
  }

  componentWillUpdate({ users, userId }) {
    const usersSharingIds = users.map(u => u.id);
    const usersConnected = Object.keys(this.webRtcPeers);

    const usersToConnect = usersSharingIds.filter(id => !usersConnected.includes(id));
    const usersToDisconnect = usersConnected.filter(id => !usersSharingIds.includes(id));

    usersToConnect.forEach(id => this.createWebRTCPeer(id, userId === id));
    usersToDisconnect.forEach(id => this.stopWebRTCPeer(id));

    console.warn('[usersToConnect]', usersToConnect);
    console.warn('[usersToDisconnect]', usersToDisconnect);
  }

  componentWillUnmount() {
    document.removeEventListener('joinVideo', this.shareWebcam);
    document.removeEventListener('exitVideo', this.unshareWebcam);

    this.ws.removeEventListener('message', this.onWsMessage);
    this.ws.removeEventListener('open', this.onWsOpen);
    this.ws.removeEventListener('close', this.onWsClose);

    window.removeEventListener('online', this.openWs);
    window.removeEventListener('offline', this.onWsClose);

    this.visibility.removeEventListeners();

    // Unshare user webcam
    if (this.state.sharedWebcam) {
      this.unshareWebcam();
    }

    Object.keys(this.webRtcPeers).forEach((id) => {
      this.stopWebRTCPeer(id);
    });

    // Close websocket connection to prevent multiple reconnects from happening
    // Don't disonnect socket on unmount to prevent multiple reconnects
    this.ws.close();
  }

  onWsOpen() {
    log('debug', '------ Websocket connection opened.');

    // -- Resend queued messages that happened when socket was not connected
    while (this.wsQueue.length > 0) {
      this.sendMessage(this.wsQueue.pop());
    }

    this.pingInterval = setInterval(this.ping.bind(this), PING_INTERVAL);

    this.setState({ socketOpen: true });
  }

  onWsClose(error) {
    log('debug', '------ Websocket connection closed.');

    this.stopWebRTCPeer(this.props.userId);
    clearInterval(this.pingInterval);

    this.setState({ socketOpen: false });
  }

  ping() {
    const message = {
      id: 'ping'
    };
    this.sendMessage(message);
  }

  onWsMessage(msg) {
    const { intl } = this.props;
    const parsedMessage = JSON.parse(msg.data);

    console.log('Received message new ws message: ');
    console.log(parsedMessage);

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
        console.debug("Received pong from server");
        break;

      case 'error':
      default:
        this.handleError(parsedMessage);
        break;
    }
  }

  sendMessage(message) {
    const ws = this.ws;

    if (this.connectedToMediaServer()) {
      const jsonMessage = JSON.stringify(message);
      log('info', `Sending message: ${jsonMessage}`);
      ws.send(jsonMessage, (error) => {
        if (error) {
          console.error(`client: Websocket error "${error}" on message "${jsonMessage.id}"`);
        }
      });
    } else {
      // No need to queue video stop messages
      if (message.id != 'stop') {
        this.wsQueue.push(message);
      }
    }
  }

  connectedToMediaServer() {
    return this.ws.readyState === WebSocket.OPEN;
  }

  startResponse(message) {
    const id = message.cameraId;
    const peer = this.webRtcPeers[id];

    log('info', 'SDP answer received from server. Processing ...');

    peer.processAnswer(message.sdpAnswer, (error) => {
      if (error) {
        return log('error', error);
      }
    });
  }

  handleIceCandidate(message) {
    const { intl } = this.props;
    const webRtcPeer = this.webRtcPeers[message.cameraId];

    if (webRtcPeer) {
      if (webRtcPeer.didSDPAnswered) {
        webRtcPeer.addIceCandidate(message.candidate, (err) => {
          if (err) {
            return log('error', `Error adding candidate: ${err}`);
          }
        });
      } else {
        webRtcPeer.iceQueue.push(message.candidate);
      }
    } else {
      log('error', ' [ICE] Message arrived after the peer was already thrown out, discarding it...');
    }
  }

  stopWebRTCPeer(id) {
    log('info', 'Stopping webcam', id);
    const userId = this.props.userId;
    const shareWebcam = id === userId;

    if (shareWebcam) {
      this.unshareWebcam();
    }

    this.sendMessage({
      type: 'video',
      role: shareWebcam ? 'share' : 'viewer',
      id: 'stop',
      cameraId: id,
    });

    // Clear the shared camera fail timeout when destroying
    clearTimeout(this.restartTimeout[id]);
    delete this.restartTimeout[id];

    this.destroyWebRTCPeer(id);
  }

  destroyWebRTCPeer(id) {
    const webRtcPeer = this.webRtcPeers[id];
    if (webRtcPeer) {
      log('info', 'Stopping WebRTC peer');
      webRtcPeer.dispose();
      delete this.webRtcPeers[id];
    } else {
      log('info', 'No WebRTC peer to stop (not an error)');
    }
  }

  createWebRTCPeer(id, shareWebcam) {
    const { intl, meetingId } = this.props;

    const videoConstraints = {
      width: {
        min: 320,
        max: 640,
      },
      height: {
        min: 180,
        max: 480,
      },
    };

    if (!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/)) {
      videoConstraints.frameRate = { min: 5, ideal: 10 };
    }

    const options = {
      mediaConstraints: {
        audio: false,
        video: videoConstraints,
      },
      onicecandidate: this._getOnIceCandidateCallback(id, shareWebcam),
    };

    let WebRtcPeerObj = window.kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly;

    if (shareWebcam) {
      WebRtcPeerObj = window.kurentoUtils.WebRtcPeer.WebRtcPeerSendonly;
      this.shareWebcam();
    }

    this.webRtcPeers[id] = new WebRtcPeerObj(options, (error) => {
      let peer = this.webRtcPeers[id];

      peer.started = false;
      peer.attached = false;
      peer.didSDPAnswered = false;
      peer.iceQueue = [];

      if (error) {
        return this._webRTCOnError(error, id, shareWebcam);
      }

      peer.generateOffer((error, offerSdp) => {

        if (error) {
          return this._webRTCOnError(error, id, shareWebcam);
        }

        log('info', `Invoking SDP offer callback function ${location.host}`);

        const message = {
          type: 'video',
          role: shareWebcam ? 'share' : 'viewer',
          id: 'start',
          sdpOffer: offerSdp,
          cameraId: id,
          meetingId,
        };
        this.sendMessage(message);

        this._processIceQueue(peer);

        peer.didSDPAnswered = true;
      });
    });
  }

  _getWebRTCStartTimeout (id, shareWebcam, peer) {
    const { intl } = this.props;

    return () => {
      log('error', `Camera share has not suceeded in ${CAMERA_SHARE_FAILED_WAIT_TIME} for ${id}`);

      if (this.props.userId === id) {
        this.notifyError(intl.formatMessage(intlMessages.sharingError));
        this.unshareWebcam();
        this.destroyWebRTCPeer(id);
      } else {
        const tag = this.webRtcPeers[id].videoTag;

        this.stopWebRTCPeer(id);
        this.createWebRTCPeer(id, shareWebcam);

        // We reattach the peer for a real video restart
        this.attachVideoStream(id, tag);

        // Increment reconnect interval
        this.restartTimer[id] = Math.min(2*this.restartTimer[id], MAX_CAMERA_SHARE_FAILED_WAIT_TIME);
      }
    };
  }

  _processIceQueue (peer) {
    const { intl } = this.props;

    while (peer.iceQueue.length) {
      const candidate = peer.iceQueue.shift();
      peer.addIceCandidate(candidate, (err) => {
        if (err) {
          this.notifyError(intl.formatMessage(intlMessages.iceCandidateError));
          return console.log(`Error adding candidate: ${err}`);
        }
      });
    }
  }

  _webRTCOnError (error, id, shareWebcam) {
    const { intl } = this.props;

    log('error', ' WebRTC peerObj create error');
    log('error', error);
    const errorMessage = intlMediaErrorsMessages[error.name]
      || intlMediaErrorsMessages.permissionError;
    this.notifyError(intl.formatMessage(errorMessage));
    /* This notification error is displayed considering kurento-utils
     * returned the error 'The request is not allowed by the user agent
     * or the platform in the current context.', but there are other
     * errors that could be returned. */

    this.stopWebRTCPeer(id);

    return log('error', error);
  }

  _getOnIceCandidateCallback(id, shareWebcam) {
    const peer = this.webRtcPeers[id];

    return (candidate) => {
      // Setup a timeout only when ice first is generated
      if (!this.restartTimeout[id]) {
        this.restartTimer[id] = this.restartTimer[id] || CAMERA_SHARE_FAILED_WAIT_TIME;

        log('info', `Setting a camera connection restart in ${this.restartTimer[id]}`);
        this.restartTimeout[id] = setTimeout(this._getWebRTCStartTimeout(id, shareWebcam, peer), this.restartTimer[id]);
      }

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

  attachVideoStream(id, video) {
    if (video.srcObject) return; // Skip if the stream is already attached

    const isCurrent = id === this.props.userId;
    const peer = this.webRtcPeers[id];
    const { peerConnection } = peer;

    const attachVideoStream = () => {
      const stream = isCurrent ? peer.getLocalStream() : peer.getRemoteStream();
      video.pause();
      video.srcObject = stream;
      video.load();
    };

    if (peer) {
      if (peer.started === true) {
        attachVideoStream();
        return;
      }

      peer.on('playStart', attachVideoStream);
    }
  }

  handlePlayStop(message) {
    const id = message.cameraId;

    log('info', 'Handle play stop for camera', id);
    this.stopWebRTCPeer(id);
  }

  handlePlayStart(message) {
    const id = message.cameraId;
    log('info', 'Handle play start for camera', id);

    const peer = this.webRtcPeers[id];

    // Clear camera shared timeout when camera succesfully starts
    clearTimeout(this.cameraTimeouts[id]);
    this.cameraTimeouts[id] = null;

    peer.emit('playStart');
    peer.started = true;

    if (id === this.props.userId) {
      VideoService.sendUserShareWebcam(id);
      VideoService.joinedVideo();
    }
  }

  handleError(message) {
    const { intl } = this.props;
    const userId = this.props.userId;

    if (message.cameraId == userId) {
      this.unshareWebcam();
      this.notifyError(intl.formatMessage(intlMessages.sharingError));
    } else {
      this.stopWebRTCPeer(message.cameraId);
    }

    log('debug', 'Handle error --------------------->');
    log('debug', message.message);
  }

  notifyError(message) {
    notify(message, 'error', 'video');
  }

  shareWebcam() {
    const { intl } = this.props;

    if (this.connectedToMediaServer()) {
      log('info', 'Sharing webcam');
      this.setState({ sharedWebcam: true });
      VideoService.joiningVideo();
    } else {
      log('debug', 'Error on sharing webcam');
      this.notifyError(intl.formatMessage(intlMessages.sharingError));
    }
  }

  unshareWebcam() {
    log('info', 'Unsharing webcam');

    VideoService.sendUserUnshareWebcam(this.props.userId);
    VideoService.exitedVideo();
    this.setState({ sharedWebcam: false });
  }

  render() {
    if (!this.state.socketOpen) return null;

    return (
      <VideoList
        users={this.props.users}
        onMount={this.attachVideoStream.bind(this)}
      />
    );
  }
}

export default injectIntl(VideoProvider);

import React, { Component } from 'react';
import { styles } from './styles';
import { defineMessages, injectIntl } from 'react-intl';
import { log } from '/imports/ui/services/api';
import { notify } from '/imports/ui/services/notification';
import { toast } from 'react-toastify';
import Toast from '/imports/ui/components/toast/component';
import _ from 'lodash';

import VideoService from '../video-dock/service';
import VideoDockContainer from '../video-dock/container';

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

const RECONNECT_WAIT_TIME = 5000;
const INITIAL_SHARE_WAIT_TIME = 2000;
const CAMERA_SHARE_FAILED_WAIT_TIME = 10000;

class VideoProvider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sharedWebcam: false
    };

    // Set a valid bbb-webrtc-sfu application server socket in the settings
    this.ws = new ReconnectingWebSocket(Meteor.settings.public.kurento.wsUrl);
    this.wsQueue = [];

    this.reconnectWebcam = false;
    this.reconnectList = [];
    this.cameraTimeouts = {};
    this.webRtcPeers = {};

    this.onWsOpen = this.onWsOpen.bind(this);
    this.onWsClose = this.onWsClose.bind(this);
    this.onWsMessage = this.onWsMessage.bind(this);

    this.unshareWebcam = this.unshareWebcam.bind(this);
    this.shareWebcam = this.shareWebcam.bind(this);
  }

  componentWillMount() {
    this.ws.addEventListener('open', this.onWsOpen);
    this.ws.addEventListener('close', this.onWsClose);

    window.addEventListener('online', this.ws.open.bind(this.ws));
    window.addEventListener('offline', this.onWsClose);
  }

  componentDidMount() {
    document.addEventListener('joinVideo', this.shareWebcam.bind(this)); // TODO find a better way to do this
    document.addEventListener('exitVideo', this.unshareWebcam.bind(this));

    this.ws.addEventListener('message', this.onWsMessage);
  }

  componentWillUnmount() {
    document.removeEventListener('joinVideo', this.shareWebcam);
    document.removeEventListener('exitVideo', this.unshareWebcam);

    this.ws.removeEventListener('message', this.onWsMessage);
    this.ws.removeEventListener('open', this.onWsOpen);
    this.ws.removeEventListener('close', this.onWsClose);

    window.removeEventListener('online', this.ws.open.bind(this.ws));
    window.removeEventListener('offline', this.onWsClose);

    // Unshare user webcam
    if (this.state.sharedWebcam) {
      this.unshareWebcam();
      this.stop(this.props.userId);
    }

    Object.keys(this.webRtcPeers).forEach((id) => {
     this.destroyWebRTCPeer(id);
    });

    // Close websocket connection to prevent multiple reconnects from happening
    this.ws.close();
  }

  componentWillUpdate(nextProps) {
    const { isLocked } = nextProps;
    if (isLocked && VideoService.isConnected()) {
      this.unshareWebcam();
    }
  }

  onWsOpen() {
    log('debug', '------ Websocket connection opened.');

    // -- Resend queued messages that happened when socket was not connected
    while (this.wsQueue.length > 0) {
      this.sendMessage(this.wsQueue.pop());
    }

    this.reconnectVideos();
  }

  onWsClose(error) {
    log('debug', '------ Websocket connection closed.');

    this.setupReconnectVideos();
  }

  setupReconnectVideos() {
    for (id in this.webRtcPeers) {
      this.disconnected(id);
      this.stop(id);
    }
  }

  reconnectVideos() {
    for (i in this.reconnectList) {
      const id = this.reconnectList[i];
      // TODO: base this on BBB API users instead of using memory
      setTimeout(() => {
        log('debug', ` [camera] Trying to reconnect camera ${id}`);
        this.start(id, id === this.myId);
      }, RECONNECT_WAIT_TIME);
    }

    this.reconnectList = [];
  }

  disconnected(id) {
    this.reconnectList.push(id);
    log('debug', ` [camera] ${id} disconnected, will try re-subscribe later.`);
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
      console.log(`Sending message: ${jsonMessage}`);
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

  connectionStatus() {
    return this.ws.readyState;
  }

  startResponse(message) {
    const id = message.cameraId;
    const webRtcPeer = this.webRtcPeers[id];

    if (message.sdpAnswer == null || webRtcPeer == null) {
      return log('debug', 'Null sdp answer or null webrtcpeer');
    }

    log('info', 'SDP answer received from server. Processing ...');

    webRtcPeer.processAnswer(message.sdpAnswer, (error) => {
      if (error) {
        return log('error', error);
      }

      if (message.cameraId == VideoService.userId()) {
        log('info', 'camera id sendusershare ', id);
        VideoService.sendUserShareWebcam(id);
      }
    });
  }

  handleIceCandidate(message) {
    const webRtcPeer = this.webRtcPeers[message.cameraId];

    if (webRtcPeer) {
      if (webRtcPeer.didSDPAnswered) {
        webRtcPeer.addIceCandidate(message.candidate, (err) => {
          if (err) {
            this.notifyError(intl.formatMessage(intlMessages.iceCandidateError));
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

  destroyWebRTCPeer(id) {
    const webRtcPeer = this.webRtcPeers[id];

    // Clear the shared camera fail timeout when destroying
    clearTimeout(this.cameraTimeouts[id]);
    this.cameraTimeouts[id] = null;

    if (webRtcPeer) {
      log('info', 'Stopping WebRTC peer');

      if (id == this.myId && this.sharedWebcam) {
        this.sharedWebcam.dispose();
        this.sharedWebcam = null;
      }

      webRtcPeer.dispose();
      delete this.webRtcPeers[id];
    } else {
      log('info', 'No WebRTC peer to stop (not an error)');
    }
  }

  initWebRTC(id, shareWebcam, options) {
    const that = this;
    const { intl } = this.props;

    let peerObj = shareWebcam ? kurentoUtils.WebRtcPeer.WebRtcPeerSendonly : kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly;

    const webRtcPeer = new peerObj(options, function (error) {
      if (error) {
        log('error', ' WebRTC peerObj create error');
        log('error', error);
        that.notifyError(intl.formatMessage(intlMessages.permissionError));
        /* This notification error is displayed considering kurento-utils
         * returned the error 'The request is not allowed by the user agent
         * or the platform in the current context.', but there are other
         * errors that could be returned. */

        that.destroyWebRTCPeer(id);
        // that.destroyVideoTag(id);
        VideoService.resetState();
        return log('error', error);
      }

      this.didSDPAnswered = false;
      this.iceQueue = [];

      that.webRtcPeers[id] = webRtcPeer;
      if (shareWebcam) {
        that.sharedWebcam = webRtcPeer;
      }

      this.generateOffer((error, offerSdp) => {
        if (error) {
          log('error', ' WebRtc generate offer error');

          that.destroyWebRTCPeer(id);
          // that.destroyVideoTag(id);

          return log('error', error);
        }

        console.log(`Invoking SDP offer callback function ${location.host}`);
        const message = {
          type: 'video',
          role: shareWebcam ? 'share' : 'viewer',
          id: 'start',
          sdpOffer: offerSdp,
          cameraId: id,
        };
        that.sendMessage(message);
      });
      while (this.iceQueue.length) {
        const candidate = this.iceQueue.shift();
        this.addIceCandidate(candidate, (err) => {
          if (err) {
            this.notifyError(intl.formatMessage(intlMessages.iceCandidateError));
            return console.error(`Error adding candidate: ${err}`);
          }
        });
      }
      this.didSDPAnswered = true;
    });
  }

  getOnIceCandidateCallback (id, shareWebcam) {
    let that = this;

    return function (candidate) {
      const message = {
        type: 'video',
        role: shareWebcam ? 'share' : 'viewer',
        id: 'onIceCandidate',
        candidate,
        cameraId: id,
      };
      that.sendMessage(message);
    }
  };

  stop(id) {
    const userId = VideoService.userId();
    this.sendMessage({
      type: 'video',
      role: id == userId ? 'share' : 'viewer',
      id: 'stop',
      cameraId: id,
    });

    if (id === userId) {
      VideoService.exitedVideo();
    }

    this.destroyWebRTCPeer(id);
  }

  handlePlayStop(message) {
    log('info', 'Handle play stop <--------------------');
    log('error', message);

    if (message.cameraId == VideoService.userId()) {
      this.unshareWebcam();
    } else {
      this.stop(message.cameraId);
    }
  }

  handlePlayStart(message) {
    log('info', 'Handle play start <===================');

    // Clear camera shared timeout when camera succesfully starts
    clearTimeout(this.cameraTimeouts[message.cameraId]);
    this.cameraTimeouts[message.cameraId] = null;

    if (message.cameraId == VideoService.userId()) {
      VideoService.joinedVideo();
    }
  }

  handleError(message) {
    const { intl } = this.props;
    const userId = VideoService.userId();

    if (message.cameraId == userId) {
      this.unshareWebcam();
      this.notifyError(intl.formatMessage(intlMessages.sharingError));
    } else {
      this.stop(message.cameraId);
    }

    console.error(' Handle error --------------------->');
    log('debug', message.message);
  }

  notifyError(message) {
    notify(message, 'error', 'video');
  }

  setCameraTimeout(id, shareWebcam) {
    this.cameraTimeouts[id] = setTimeout(() => {
      log('error', `Camera share has not suceeded in ${CAMERA_SHARE_FAILED_WAIT_TIME}`);
      if (this.myId == id) {
        this.notifyError(intl.formatMessage(intlMessages.sharingError));
        this.unshareWebcam();
      } else {
        this.stop(id);
        that.start(id, shareWebcam);
      }
    }, CAMERA_SHARE_FAILED_WAIT_TIME);
  }

  shareWebcam() {
    this.setState({sharedWebcam: true});

    VideoService.joiningVideo();

    log("info", "Share webcam BRO!!!");

    // if (this.connectedToMediaServer()) {
    //   this.start(userId, true);
    // } else {
    //   log('error', 'Not connected to media server');
    // }
  }

  unshareWebcam() {
    log('info', 'Unsharing webcam');
    VideoService.sendUserUnshareWebcam(VideoService.userId());
  }

  render() {
    return (
      <VideoDockContainer
        onStart={this.initWebRTC.bind(this)}
        onStop={this.stop.bind(this)}
        getOnIceCandidateCallback={this.getOnIceCandidateCallback.bind(this)}
        sharedWebcam={this.state.sharedWebcam} />
    );
  }

}

export default injectIntl(VideoProvider);
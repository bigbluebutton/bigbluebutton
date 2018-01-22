import React, { Component } from 'react';
import { styles } from './styles';
import { defineMessages, injectIntl } from 'react-intl';
import VideoService from './service';
import { log } from '/imports/ui/services/api';
import { notify } from '/imports/ui/services/notification';
import { toast } from 'react-toastify';
import Toast from '/imports/ui/components/toast/component';

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

class VideoElement extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let cssClass;
    if (this.props.shared || !this.props.localCamera) {
      cssClass = styles.sharedWebcamVideoLocal;
    }
    else {
      cssClass = styles.sharedWebcamVideo;
    }
    return (
      <div className={styles.videoContainer + " " + cssClass} >
        { this.props.localCamera ?
            <video id="shareWebcam" muted={true} autoPlay={true} playsInline={true} />
          :
            <video id={`video-elem-${this.props.videoId}`} width={320} height={240} autoPlay={true} playsInline={true} />
        }
        <div className={styles.videoText}>
          <span className={styles.userName}>{this.props.name}</span>
          <Button
            label=""
            className={styles.pauseButton}
            icon={'unmute'}
            size={'sm'}
            circle
            onClick={() => {}}
          />
        </div>
      </div>
    );
  }

  componentDidMount() {
    if (typeof this.props.onMount === 'function' && !this.props.localCamera) {
      this.props.onMount(this.props.videoId, false);
    }
  }
}

class VideoDock extends Component {
  constructor(props) {
    super(props);

    // Set a valid bbb-webrtc-sfu application server socket in the settings
    this.ws = new ReconnectingWebSocket(Meteor.settings.public.kurento.wsUrl);
    this.wsQueue = [];
    this.webRtcPeers = {};
    this.reconnectWebcam = false;
    this.reconnectList = [];
    this.cameraTimeouts = {};

    this.state = {
      videos: {},
      sharedWebcam: false,
    };

    this.unshareWebcam = this.unshareWebcam.bind(this);
    this.shareWebcam = this.shareWebcam.bind(this);

    this.onWsOpen = this.onWsOpen.bind(this);
    this.onWsClose = this.onWsClose.bind(this);
    this.onWsMessage = this.onWsMessage.bind(this);
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
      if (id != this.myId) {
        setTimeout(() => {
          log('debug', ` [camera] Trying to reconnect camera ${id}`);
          this.start(id, false);
        }, RECONNECT_WAIT_TIME);
      }
    }

    if (this.reconnectWebcam) {
      log('debug', ` [camera] Trying to re-share ${this.myId} after reconnect.`);
      this.start(this.myId, true);
    }

    this.reconnectWebcam = false;
    this.reconnectList = [];
  }

  componentDidMount() {
    const ws = this.ws;
    const { users, userId } = this.props;

    users.forEach((user) => {
      if (user.has_stream && user.userId !== userId) {
        // FIX: Really ugly hack, but sometimes the ICE candidates aren't
        // generated properly when we send videos right after componentDidMount
        setTimeout(() => {
          this.start(user.userId, false);
        }, INITIAL_SHARE_WAIT_TIME);
      }
    });

    document.addEventListener('joinVideo', this.shareWebcam.bind(this)); // TODO find a better way to do this
    document.addEventListener('exitVideo', this.unshareWebcam.bind(this));
    document.addEventListener('installChromeExtension', this.installChromeExtension.bind(this));

    window.addEventListener('resize', this.adjustVideos);

    ws.addEventListener('message', this.onWsMessage);
  }

  componentWillMount() {
    this.ws.addEventListener('open', this.onWsOpen);
    this.ws.addEventListener('close', this.onWsClose);

    window.addEventListener('online', this.ws.open.bind(this.ws));
    window.addEventListener('offline', this.onWsClose);
  }

  componentWillUpdate(nextProps) {
    const { isLocked } = nextProps;
    if (isLocked && VideoService.isConnected()) {
      this.unshareWebcam();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('joinVideo', this.shareWebcam);
    document.removeEventListener('exitVideo', this.unshareWebcam);
    document.removeEventListener('installChromeExtension', this.installChromeExtension);
    window.removeEventListener('resize', this.adjustVideos);

    this.ws.removeEventListener('message', this.onWsMessage);
    this.ws.removeEventListener('open', this.onWsOpen);
    this.ws.removeEventListener('close', this.onWsClose);
    // Close websocket connection to prevent multiple reconnects from happening

    window.removeEventListener('online', this.ws.open.bind(this.ws));
    window.removeEventListener('offline', this.onWsClose);

    this.ws.close();
  }

  adjustVideos() {
    setTimeout(() => {
      window.adjustVideos('webcamArea', true);
    }, 0);
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
        const webRtcPeer = this.webRtcPeers[parsedMessage.cameraId];

        if (!!webRtcPeer) {
          if (webRtcPeer.didSDPAnswered) {
            webRtcPeer.addIceCandidate(parsedMessage.candidate, (err) => {
              if (err) {
                this.notifyError(intl.formatMessage(intlMessages.iceCandidateError));
                return log('error', `Error adding candidate: ${err}`);
              }
            });
          } else {
            webRtcPeer.iceQueue.push(parsedMessage.candidate);
          }
        } else {
          log('error', ' [ICE] Message arrived after the peer was already thrown out, discarding it...');
        }
        break;

      case 'error':
      default:
        this.handleError(parsedMessage);
        break;
    }
  }

  start(id, shareWebcam) {
    const that = this;
    const { intl } = this.props;

    console.log(`Starting video call for video: ${id} with ${shareWebcam}`);

    this.cameraTimeouts[id] = setTimeout(() => {
      log('error', `Camera share has not suceeded in ${CAMERA_SHARE_FAILED_WAIT_TIME}`);
      if (that.myId == id) {
        that.notifyError(intl.formatMessage(intlMessages.sharingError));
        that.unshareWebcam();
      } else {
        that.stop(id);
        that.start(id, shareWebcam);
      }
    }, CAMERA_SHARE_FAILED_WAIT_TIME);

    if (shareWebcam) {
      VideoService.joiningVideo();
      this.setState({ sharedWebcam: true });
      this.myId = id;
      this.initWebRTC(id, true);
    } else {
      // initWebRTC with shareWebcam false will be called after react mounts the element
      this.createVideoTag(id);
    }
  }

  initWebRTC(id, shareWebcam) {
    const that = this;
    const { intl } = this.props;

    const onIceCandidate = function (candidate) {
      const message = {
        type: 'video',
        role: shareWebcam ? 'share' : 'viewer',
        id: 'onIceCandidate',
        candidate,
        cameraId: id,
      };
      that.sendMessage(message);
    };

    let videoConstraints = {};
    if (navigator.userAgent.match(/Version\/[\d\.]+.*Safari/)) {
      // Custom constraints for Safari
      videoConstraints = {
        width: {
          min: 320,
          max: 640,
        },
        height: {
          min: 240,
          max: 480,
        },
      };
    } else {
      videoConstraints = {
        width: {
          min: 320,
          ideal: 320,
        },
        height: {
          min: 240,
          ideal: 240,
        },
        frameRate: {
          min: 5,
          ideal: 10,
        },
      };
    }

    const options = {
      mediaConstraints: {
        audio: false,
        video: videoConstraints,
      },
      onicecandidate: onIceCandidate,
    };

    let peerObj;
    if (shareWebcam) {
      options.localVideo = document.getElementById("shareWebcam");
      peerObj = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly;
    } else {
      peerObj = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly;
      options.remoteVideo = document.getElementById(`video-elem-${id}`);
    }

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
        that.destroyVideoTag(id);
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
          that.destroyVideoTag(id);

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

  disconnected(id) {
    if (this.sharedWebcam) {
      log('debug', ' [camera] Webcam disconnected, will try re-share webcam later.');
      this.reconnectWebcam = true;
    } else {
      this.reconnectList.push(id);

      log('debug', ` [camera] ${id} disconnected, will try re-subscribe later.`);
    }
  }

  stop(id) {
    const { userId } = this.props;
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
    this.destroyVideoTag(id);
  }

  createVideoTag(id) {
    const videos = this.state.videos;

    videos[id] = true;
    this.setState({ videos });
  }

  destroyVideoTag(id) {
    const videos = this.state.videos;

    delete videos[id];
    this.setState({ videos });

    if (id == this.myId) {
      this.setState({ sharedWebcam: false });
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

  shareWebcam() {
    const { users, userId } = this.props;

    if (this.connectedToMediaServer()) {
      this.start(userId, true);
    } else {
      log('error', 'Not connected to media server');
    }
  }

  unshareWebcam() {
    VideoService.exitingVideo();
    log('info', 'Unsharing webcam');
    console.warn(this.props);
    const { userId } = this.props;
    VideoService.sendUserUnshareWebcam(userId);
  }

  startResponse(message) {
    const id = message.cameraId;
    const webRtcPeer = this.webRtcPeers[id];

    if (message.sdpAnswer == null) {
      return log('debug', 'Null sdp answer. Camera unplugged?');
    }

    if (webRtcPeer == null) {
      return log('debug', 'Null webrtc peer ????');
    }

    log('info', 'SDP answer received from server. Processing ...');

    webRtcPeer.processAnswer(message.sdpAnswer, (error) => {
      if (error) {
        return log('error', error);
      }

      if (message.cameraId == this.props.userId) {
        log('info', 'camera id sendusershare ', id);
        VideoService.sendUserShareWebcam(id);
      }
    });
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

  handlePlayStop(message) {
    log('info', 'Handle play stop <--------------------');
    log('error', message);

    if (message.cameraId == this.props.userId) {
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

    if (message.cameraId == this.props.userId) {
      VideoService.joinedVideo();
    }
  }

  handleError(message) {
    const { intl, userId } = this.props;

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

  installChromeExtension() {
    const { intl } = this.props;
    const CHROME_EXTENSION_LINK = Meteor.settings.public.kurento.chromeExtensionLink;

    this.notifyError(<div>
      {intl.formatMessage(intlMessages.chromeExtensionError)}{' '}
      <a href={CHROME_EXTENSION_LINK} target="_blank">
        {intl.formatMessage(intlMessages.chromeExtensionErrorLink)}
      </a>
                     </div>);
  }

  componentDidUpdate() {
    this.adjustVideos();
  }

  render() {
<<<<<<< HEAD
    let cssClass;
    if (this.state.sharedWebcam) {
      cssClass = styles.sharedWebcamVideoLocal;
    } else {
      cssClass = styles.sharedWebcamVideo;
    }
=======
>>>>>>> 4a34657... User video tags with new design [part 1]

    return (
      <div className={styles.videoDock}>
        <div id="webcamArea">
<<<<<<< HEAD
          {Object.keys(this.state.videos).map(id => (
            <VideoElement videoId={id} key={id} onMount={this.initWebRTC.bind(this)} />
          ))}
          <video
            autoPlay="autoPlay"
            playsInline="playsInline"
            muted="muted"
            id="shareWebcamVideo"
            className={cssClass}
            ref="videoInput"
          />
=======
          {Object.keys(this.state.videos).map((id) => {
            return (
              <VideoElement videoId={id} key={id} name={id} localCamera={false} onMount={this.initWebRTC.bind(this)} />
            );
          })}
          <VideoElement shared={this.state.sharedWebcam} name={this.myId} localCamera={true} />
>>>>>>> 4a34657... User video tags with new design [part 1]
        </div>
      </div>
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { userId } = this.props;
    const currentUsers = this.props.users || {};
    const nextUsers = nextProps.users;

    let users = {};
    let present = {};

    if (!currentUsers)
      return false;


    // Map user objectos to an object in the form {userId: has_stream}
    currentUsers.forEach((user) => {
      users[user.userId] = user.has_stream;
    });


    // Keep instances where the flag has changed or next user adds it
    nextUsers.forEach((user) => {
      let id = user.userId;
      // The case when a user exists and stream status has not changed
      if (users[id] === user.has_stream) {
        delete users[id];
      } else {
        // Case when a user has been added to the list
        users[id] = user.has_stream;
      }

      // Mark the ids which are present in nextUsers
      present[id] = true;
    });

    const userIds = Object.keys(users);

    for (let i = 0; i < userIds.length; i++) {
      let id = userIds[i];

      // If a userId is not present in nextUsers let's stop it
      if (!present[id]) {
        this.stop(id);
        continue;
      }

      console.log(`User ${users[id] ? '' : 'un'}shared webcam ${id}`);

      // If a user stream is true, changed and was shared by other
      // user we'll start it. If it is false and changed we stop it
      if (users[id]) {
        if (userId !== id) {
          this.start(id, false);
        }
      }
      else {
        this.stop(id);
      }
    }
    return true;
  }
}

export default injectIntl(VideoDock);

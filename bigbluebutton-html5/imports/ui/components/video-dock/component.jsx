import React, { Component } from 'react';
import ScreenshareContainer from '/imports/ui/components/screenshare/container';
import { styles } from './styles';
import { log } from '/imports/ui/services/api';


class VideoElement extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <video id={`video-elem-${this.props.videoId}`} width={320} height={240} autoPlay={true} playsInline={true} />;
  }

  componentDidMount() {
    this.props.onMount(this.props.videoId, false);
  }
}

export default class VideoDock extends Component {
  constructor(props) {
    super(props);

    // Set a valid bbb-webrtc-sfu application server socket in the settings
    this.ws = new ReconnectingWebSocket(Meteor.settings.public.kurento.wsUrl);
    this.wsQueue = [];
    this.webRtcPeers = {};
    this.reconnectWebcam = false;
    this.reconnectList = false;
    this.sharedCameraTimeout = null;
    this.subscribedCamerasTimeouts = [];

    this.state = {
      videos: {},
      sharedWebcam : false,
    };

    this.sendUserShareWebcam = props.sendUserShareWebcam.bind(this);
    this.sendUserUnshareWebcam = props.sendUserUnshareWebcam.bind(this);

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
        }, 5000);
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
    const { users } = this.props;
    const id = users[0].userId;

    for (let i = 0; i < users.length; i++) {
      if (users[i].has_stream && users[i].userId !== id) {
        this.start(users[i].userId, false);
      }
    }

    document.addEventListener('joinVideo', this.shareWebcam.bind(this));// TODO find a better way to do this
    document.addEventListener('exitVideo', this.unshareWebcam.bind(this));

    window.addEventListener('resize', this.adjustVideos);

    ws.addEventListener('message', this.onWsMessage);
  }

  componentWillMount () {
    this.ws.addEventListener('open', this.onWsOpen);
    this.ws.addEventListener('close', this.onWsClose);
  }

  componentWillUnmount () {
    document.removeEventListener('joinVideo', this.shareWebcam);
    document.removeEventListener('exitVideo', this.shareWebcam);
    window.removeEventListener('resize', this.adjustVideos);

    this.ws.removeEventListener('message', this.onWsMessage);
    this.ws.removeEventListener('open', this.onWsOpen);
    this.ws.removeEventListener('close', this.onWsClose);
    // Close websocket connection to prevent multiple reconnects from happening
    this.ws.close();
  }

  adjustVideos () {
    window.adjustVideos('webcamArea', true);
  }

  onWsOpen () {
    log('debug', '------ Websocket connection opened.');

    // -- Resend queued messages that happened when socket was not connected
    while (this.wsQueue.length > 0) {
      this.sendMessage(this.wsQueue.pop());
    }

    this.reconnectVideos();
  }

  onWsClose (error) {
    log('debug', '------ Websocket connection closed.');

    this.setupReconnectVideos();
  }

  onWsMessage (msg) {
    const parsedMessage = JSON.parse(msg.data);

    console.log('Received message new ws message: ');
    console.log(parsedMessage);

    switch (parsedMessage.id) {

      case 'startResponse':
        this.startResponse(parsedMessage);
        break;

      case 'error':
        this.handleError(parsedMessage);
        break;

      case 'playStart':
        this.handlePlayStart(parsedMessage);
        break;

      case 'playStop':
        this.handlePlayStop(parsedMessage);

        break;

      case 'iceCandidate':

        const webRtcPeer = this.webRtcPeers[parsedMessage.cameraId];

        if (webRtcPeer !== null) {
          if (webRtcPeer.didSDPAnswered) {
            webRtcPeer.addIceCandidate(parsedMessage.candidate, (err) => {
              if (err) {
                return log('error', `Error adding candidate: ${err}`);
              }
            });
          } else {
            webRtcPeer.iceQueue.push(parsedMessage.candidate);
          }
        } else {
          log('error', ' [ICE] Message arrived before webRtcPeer?');
        }
        break;
    }
  };

  start(id, shareWebcam) {
    const that = this;

    console.log(`Starting video call for video: ${id} with ${shareWebcam}`);

    if (shareWebcam) {
      this.setState({sharedWebcam: true});
      this.initWebRTC(id, true);
    } else {
      // initWebRTC with shareWebcam false will be called after react mounts the element
      this.createVideoTag(id);
    }
  }

  initWebRTC(id, shareWebcam) {
    let that = this;

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
    if (!!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/)) { // Custom constraints for Safari
      videoConstraints = {
        width: {min:320, max:640},
        height: {min:240, max:480}
      }
    } else {
      videoConstraints = {
        width: {min: 320, ideal: 320},
        height: {min: 240, ideal:240},
        frameRate: {min: 5, ideal: 10}
      };
    }

    let options = {
      mediaConstraints: {
        audio: false,
        video: videoConstraints
      },
      onicecandidate: onIceCandidate,
    };

    let peerObj;
    if (shareWebcam) {
      options.localVideo = this.refs.videoInput;
      peerObj = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly;
    } else {
      peerObj = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly;
      options.remoteVideo = document.getElementById(`video-elem-${id}`);
    }

    let webRtcPeer = new peerObj(options, function (error) {
      if (error) {
        log('error', ' WebRTC peerObj create error');

        that.destroyWebRTCPeer(id);
        that.destroyVideoTag(id);

        return log('error', error);
      }

      this.didSDPAnswered = false;
      this.iceQueue = [];

      that.webRtcPeers[id] = webRtcPeer;
      if (shareWebcam) {
        that.sharedWebcam = webRtcPeer;
        that.myId = id;
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
        let candidate = this.iceQueue.shift();
        this.addIceCandidate(candidate, (err) => {
          if (err) {
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
    const { users } = this.props;
    this.sendMessage({
      type: 'video',
      role: id == users[0].userId ? 'share' : 'viewer',
      id: 'stop',
      cameraId: id,
    });

    this.destroyWebRTCPeer(id);
    this.destroyVideoTag(id);
  }

  createVideoTag(id) {
    let videos = this.state.videos;

    videos[id] = true;
    this.setState({videos: videos})
  }

  destroyVideoTag(id) {
    let videos = this.state.videos;

    delete videos[id];
    this.setState({videos: videos});

    if (id == this.myId) {
      this.setState({sharedWebcam: false});
    }
  }

  destroyWebRTCPeer(id) {
    const webRtcPeer = this.webRtcPeers[id];

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
    const { users } = this.props;
    const id = users[0].userId;

    if (this.connectedToMediaServer()) {
      this.start(id, true);
    } else {
      log("error", "Not connected to media server BRA");
    }
  }

  unshareWebcam() {
    log('info', 'Unsharing webcam');
    const { users } = this.props;
    const id = users[0].userId;
    this.sendUserUnshareWebcam(id);
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
    });

    this.sendUserShareWebcam(id);
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

    const { users } = this.props;

    if (message.cameraId == users[0].userId) {
      this.unshareWebcam();
    } else {
      this.stop(message.cameraId);
    }
  }

  handlePlayStart(message) {
    log('info', 'Handle play start <===================');
  }

  handleError(message) {
    console.error(' Handle error --------------------->');
    log('debug', message.message);
  }

  componentDidUpdate() {
    this.adjustVideos();
  }

  render() {
    let cssClass;
    if (this.state.sharedWebcam) {
      cssClass = styles.sharedWebcamVideoLocal;
    }
    else {
      cssClass = styles.sharedWebcamVideo;
    }

    return (

      <div className={styles.videoDock}>
        <div id="webcamArea">
          {Object.keys(this.state.videos).map((id) => {
            return (<VideoElement videoId={id} key={id} onMount={this.initWebRTC.bind(this)} />);
          })}
          <video autoPlay={true} playsInline={true} muted={true} id="shareWebcamVideo" className={cssClass} ref="videoInput" />
        </div>
      </div>
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { users } = this.props;
    const nextUsers = nextProps.users;
    const id = users[0].userId;

    if (users) {
      let suc = false;

      for (let i = 0; i < users.length; i++) {
        if (users && users[i] &&
              nextUsers && nextUsers[i]) {
          if (users[i].has_stream !== nextUsers[i].has_stream) {
            console.log(`User ${nextUsers[i].has_stream ? '' : 'un'}shared webcam ${users[i].userId}`);

            if (nextUsers[i].has_stream) {
              if (id !== users[i].userId) {
                this.start(users[i].userId, false);
              }
            } else {
              this.stop(users[i].userId);
            }

            if (!nextUsers[i].has_stream) {
              this.destroyVideoTag(users[i].userId);
            }

            suc = suc || true;
          }
        }
      }

      return true;
    }

    return false;
  }
}

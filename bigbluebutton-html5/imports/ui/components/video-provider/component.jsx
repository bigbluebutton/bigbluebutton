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

const CAMERA_SHARE_FAILED_WAIT_TIME = 10000;
const PING_INTERVAL = 15000;

class VideoProvider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sharedWebcam: false,
      socketOpen: false,
      stats: [],
    };

    // Set a valid bbb-webrtc-sfu application server socket in the settings
    this.ws = new ReconnectingWebSocket(Meteor.settings.public.kurento.wsUrl);
    this.wsQueue = [];

    this.visibility = new VisibilityEvent();

    this.reconnectWebcam = false;
    this.cameraTimeouts = {};
    this.webRtcPeers = {};
    this.monitoredTracks = {};

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
      if (this.props.userId !== id) {
        this._sendPauseStream(id, 'viewer', true);
      }
    });
  }

  unpauseViewers () {
    log("debug", "Calling un-pause in viewer streams");

    Object.keys(this.webRtcPeers).forEach((id) => {
      if (id !== this.props.userId) {
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
      this.stopGettingStats(id);
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

      if (message.cameraId == this.props.userId) {
        log('info', 'camera id sendusershare ', id);
        VideoService.sendUserShareWebcam(id);
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
    clearTimeout(this.cameraTimeouts[id]);
    delete this.cameraTimeouts[id];
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
    const that = this;
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
      onicecandidate: this.getOnIceCandidateCallback(id, shareWebcam),
    };

    let WebRtcPeerObj = window.kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly;

    if (shareWebcam) {
      WebRtcPeerObj = window.kurentoUtils.WebRtcPeer.WebRtcPeerSendonly;
      this.shareWebcam();
    }

    WebRtcPeerObj.started = false;

    that.webRtcPeers[id] = new WebRtcPeerObj(options, function (error) {
      if (error) {
        log('error', ' WebRTC peerObj create error');
        log('error', error);
        that.notifyError(intl.formatMessage(intlMessages.permissionError));
        /* This notification error is displayed considering kurento-utils
         * returned the error 'The request is not allowed by the user agent
         * or the platform in the current context.', but there are other
         * errors that could be returned. */

        that.stopWebRTCPeer(id);

        if (shareWebcam) {
          that.unshareWebcam();
        }

        return log('error', error);
      }

      this.didSDPAnswered = false;
      this.iceQueue = [];

      this.generateOffer((error, offerSdp) => {
        if (error) {
          log('error', ' WebRtc generate offer error');

          that.stopWebRTCPeer(id);
          return log('error', error);
        }

        that.cameraTimeouts[id] = setTimeout(() => {
          log('error', `Camera share has not suceeded in ${CAMERA_SHARE_FAILED_WAIT_TIME} for ${id}`);
          if (that.props.userId == id) {
            that.notifyError(intl.formatMessage(intlMessages.sharingError));
            that.unshareWebcam();
            that.destroyWebRTCPeer(id);
          } else {
            that.stopWebRTCPeer(id);
            that.createWebRTCPeer(id, shareWebcam);
          }
        }, CAMERA_SHARE_FAILED_WAIT_TIME);

        console.log(`Invoking SDP offer callback function ${location.host}`);
        const message = {
          type: 'video',
          role: shareWebcam ? 'share' : 'viewer',
          id: 'start',
          sdpOffer: offerSdp,
          cameraId: id,
          meetingId,
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

  getOnIceCandidateCallback(id, shareWebcam) {
    const that = this;

    return function (candidate) {
      const message = {
        type: 'video',
        role: shareWebcam ? 'share' : 'viewer',
        id: 'onIceCandidate',
        candidate,
        cameraId: id,
      };
      that.sendMessage(message);
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

  customGetStats(peer, mediaStreamTrack, callback, interval) {
    const statsState = this.state.stats;
    const that = this;
    let promise;
    try {
      promise = peer.getStats(mediaStreamTrack);
    } catch (e) {
      promise = Promise.reject(e);
    }
    promise.then(function(results) {
      let videoInOrOutbound = {};
      results.forEach(function(res) {
        if (res.type == 'ssrc' || res.type == 'inbound-rtp' || res.type == 'outbound-rtp') {
          res.packetsSent = parseInt(res.packetsSent);
          res.packetsLost = parseInt(res.packetsLost) || 0;
          res.packetsReceived = parseInt(res.packetsReceived);

          if ((isNaN(res.packetsSent) && res.packetsReceived == 0)
            || (res.type == 'outbound-rtp' && res.isRemote)) {
            return; // Discard local video receiving
          }

          if (res.googFrameWidthReceived) {
            res.width = parseInt(res.googFrameWidthReceived);
            res.height = parseInt(res.googFrameHeightReceived);
          } else if (res.googFrameWidthSent) {
            res.width = parseInt(res.googFrameWidthSent);
            res.height = parseInt(res.googFrameHeightSent);
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
      };

      let videoStatsArray = statsState;
      videoStatsArray.push(videoStats);
      while (videoStatsArray.length > 5) {// maximum interval to consider
        videoStatsArray.shift();
      }
      that.setState({ stats: videoStatsArray });

      const firstVideoStats = videoStatsArray[0];
      const lastVideoStats = videoStatsArray[videoStatsArray.length - 1];

      const videoIntervalPacketsLost = lastVideoStats.packetsLost - firstVideoStats.packetsLost;
      const videoIntervalPacketsReceived = lastVideoStats.packetsReceived - firstVideoStats.packetsReceived;
      const videoIntervalPacketsSent = lastVideoStats.packetsSent - firstVideoStats.packetsSent;
      const videoIntervalBytesReceived = lastVideoStats.bytesReceived - firstVideoStats.bytesReceived;
      const videoIntervalBytesSent = lastVideoStats.bytesSent - firstVideoStats.bytesSent;

      const videoReceivedInterval = lastVideoStats.timestamp - firstVideoStats.timestamp;
      const videoSentInterval = lastVideoStats.timestamp - firstVideoStats.timestamp;

      const videoKbitsReceivedPerSecond = videoIntervalBytesReceived * 8 / videoReceivedInterval;
      const videoKbitsSentPerSecond = videoIntervalBytesSent * 8 / videoSentInterval;
      const videoPacketDuration = videoIntervalPacketsSent / videoSentInterval * 1000;

      let videoLostPercentage, videoLostRecentPercentage, videoBitrate;
      if (videoStats.packetsReceived > 0) { // Remote video
        videoLostPercentage = ((videoStats.packetsLost / (videoStats.packetsLost + videoStats.packetsReceived) * 100) || 0).toFixed(1);
        videoBitrate = Math.floor(videoKbitsReceivedPerSecond || 0);
        videoLostRecentPercentage = ((videoIntervalPacketsLost / (videoIntervalPacketsLost + videoIntervalPacketsReceived) * 100) || 0).toFixed(1);
      } else {
        videoLostPercentage = ((videoStats.packetsLost / (videoStats.packetsLost + videoStats.packetsSent) * 100) || 0).toFixed(1);
        videoBitrate = Math.floor(videoKbitsSentPerSecond || 0);
        videoLostRecentPercentage = ((videoIntervalPacketsLost / (videoIntervalPacketsLost + videoIntervalPacketsSent) * 100) || 0).toFixed(1);
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
        }
      };

      callback(result);
    }, function(exception) {
      console.error("customGetStats() Promise rejected:", exception.message);
      callback(null);
    });
  }

  monitorTrackStart(peer, track, local, callback){
    const that = this;
    console.log("Starting stats monitoring on", track.id);
    const getStatsInterval = 2000;

    const callGetStats = () => {
      that.customGetStats(
        peer,
        track,
        function(results) {
          if (results == null || peer.signalingState == "closed") {
            that.monitorTrackStop(track.id);
          } else {
            callback(results);
          }
        },
        getStatsInterval
      )
    };

    if (!this.monitoredTracks[track.id]) {
      callGetStats();
      this.monitoredTracks[track.id] = setInterval(
        callGetStats,
        getStatsInterval,
      );
    } else {
      console.log("Already monitoring this track");
    }
  }

  monitorTrackStop(trackId){
    if (this.monitoredTracks[trackId]) {
      clearInterval(this.monitoredTracks[trackId]);
      delete this.monitoredTracks[trackId];
      console.log("Track " + trackId + " removed");
    } else {
      console.log("Track " + trackId + " is not monitored");
    }
  }

  getStats(id, video, callback) {
    const isCurrent = id === this.props.userId;
    const peer = this.webRtcPeers[id];

    if (peer) {
      if (peer.started === true) {
        if (peer.peerConnection.getLocalStreams().length > 0){
          this.monitorTrackStart(peer.peerConnection, peer.peerConnection.getLocalStreams()[0].getVideoTracks()[0], true, callback);
        } else if (peer.peerConnection.getRemoteStreams().length > 0){
          this.monitorTrackStart(peer.peerConnection, peer.peerConnection.getRemoteStreams()[0].getVideoTracks()[0], false, callback);
        }
        return;
      }
    }
  }

  stopGettingStats(id) {
    const isCurrent = id === this.props.userId;
    const peer = this.webRtcPeers[id];

    if (peer) {
      if (peer.started === true) {
        if (peer.peerConnection.getLocalStreams().length > 0){
          this.monitorTrackStop(peer.peerConnection.getLocalStreams()[0].getVideoTracks()[0].id);
        } else if (peer.peerConnection.getRemoteStreams().length > 0){
          this.monitorTrackStop(peer.peerConnection.getRemoteStreams()[0].getVideoTracks()[0].id);
        }
        return;
      }
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

    if (message.cameraId == this.props.userId) {
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

    console.error(' Handle error --------------------->');
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
        getStats={this.getStats.bind(this)}
        stopGettingStats={this.stopGettingStats.bind(this)}
      />
    );
  }
}

export default injectIntl(VideoProvider);

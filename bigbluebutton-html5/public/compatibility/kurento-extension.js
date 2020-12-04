const isFirefox = typeof window.InstallTrigger !== 'undefined';
const isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
const isChrome = !!window.chrome && !isOpera;
const isSafari = navigator.userAgent.indexOf('Safari') >= 0 && !isChrome;
const isElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;
const hasDisplayMedia = (typeof navigator.getDisplayMedia === 'function'
  || (navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function'));

Kurento = function (
  tag,
  voiceBridge,
  userId,
  internalMeetingId,
  onFail,
  onSuccess,
  options = {},
) {
  this.ws = null;
  this.video = null;
  this.screen = null;
  this.webRtcPeer = null;
  this.mediaCallback = null;

  this.renderTag = tag;
  this.voiceBridge = voiceBridge;
  this.userId = userId;
  this.internalMeetingId = internalMeetingId;

  // Optional parameters are: userName, caleeName, chromeExtension, wsUrl, iceServers,
  // chromeScreenshareSources, firefoxScreenshareSource, logger, stream

  Object.assign(this, options);

  this.SEND_ROLE = 'send';
  this.RECV_ROLE = 'recv';
  this.SFU_APP = 'screenshare';
  this.ON_ICE_CANDIDATE_MSG = 'iceCandidate';
  this.PING_INTERVAL = 15000;

  window.Logger = this.logger || console;

  if (this.wsUrl == null) {
    this.defaultPath = 'bbb-webrtc-sfu';
    this.hostName = window.location.hostname;
    this.wsUrl = `wss://${this.hostName}/${this.defaultPath}`;
  }

  if (this.chromeScreenshareSources == null) {
    this.chromeScreenshareSources = ['screen', 'window'];
  }

  if (this.firefoxScreenshareSource == null) {
    this.firefoxScreenshareSource = 'window';
  }

  // Limiting max resolution to WQXGA
  // In FireFox we force full screen share and in the case
  // of multiple screens the total area shared becomes too large
  this.vid_max_width = 2560;
  this.vid_max_height = 1600;
  this.width = window.screen.width;
  this.height = window.screen.height;


  this.userId = userId;

  this.pingInterval = null;

  // TODO FIXME we need to implement a handleError method to normalize errors
  // generated in this script
  if (onFail != null) {
    this.onFail = Kurento.normalizeCallback(onFail);
  } else {
    const _this = this;
    this.onFail = function () {
      _this.logger.error('Default error handler');
    };
  }

  if (onSuccess != null) {
    this.onSuccess = Kurento.normalizeCallback(onSuccess);
  } else {
    const _this = this;
    this.onSuccess = function () {
      _this.logger.info('Default success handler');
    };
  }
};

this.KurentoManager = function () {
  this.kurentoVideo = null;
  this.kurentoScreenshare = null;
  this.kurentoAudio = null;
};

KurentoManager.prototype.exitScreenShare = function () {
  if (typeof this.kurentoScreenshare !== 'undefined' && this.kurentoScreenshare) {
    if (this.kurentoScreenshare.logger !== null) {
      this.kurentoScreenshare.logger.info({ logCode: 'kurentoextension_exit_screenshare_presenter' },
        'Exiting screensharing as presenter');
    }

    if(this.kurentoScreenshare.webRtcPeer) {
      this.kurentoScreenshare.webRtcPeer.peerConnection.oniceconnectionstatechange = null;
    }

    if (this.kurentoScreenshare.ws !== null) {
      this.kurentoScreenshare.ws.onclose = function () {};
      this.kurentoScreenshare.ws.close();
    }

    if (this.kurentoScreenshare.pingInterval) {
      clearInterval(this.kurentoScreenshare.pingInterval);
    }

    this.kurentoScreenshare.dispose();
    this.kurentoScreenshare = null;
  }
};

KurentoManager.prototype.exitVideo = function () {
  try {
    if (typeof this.kurentoVideo !== 'undefined' && this.kurentoVideo) {
      if(this.kurentoVideo.webRtcPeer) {
        this.kurentoVideo.webRtcPeer.peerConnection.oniceconnectionstatechange = null;
      }

      if (this.kurentoVideo.logger !== null) {
        this.kurentoScreenshare.logger.info({ logCode: 'kurentoextension_exit_screenshare_viewer' },
          'Exiting screensharing as viewer');
      }

      if (this.kurentoVideo.ws !== null) {
        this.kurentoVideo.ws.onclose = function () {};
        this.kurentoVideo.ws.close();
      }

      if (this.kurentoVideo.pingInterval) {
        clearInterval(this.kurentoVideo.pingInterval);
      }

      this.kurentoVideo.dispose();
      this.kurentoVideo = null;
    }
  }
  catch (err) {
    if (this.kurentoVideo) {
      this.kurentoVideo.dispose();
      this.kurentoVideo = null;
    }
  }
};

KurentoManager.prototype.exitAudio = function () {
  if (typeof this.kurentoAudio !== 'undefined' && this.kurentoAudio) {
    if (this.kurentoAudio.logger !== null) {
      this.kurentoAudio.logger.info({ logCode: 'kurentoextension_exit_listen_only' },
        'Exiting listen only');
    }

    if (this.kurentoAudio.webRtcPeer) {
      this.kurentoAudio.webRtcPeer.peerConnection.oniceconnectionstatechange = null;
    }

    if (this.kurentoAudio.ws !== null) {
      this.kurentoAudio.ws.onclose = function () {};
      this.kurentoAudio.ws.close();
    }

    if (this.kurentoAudio.pingInterval) {
      clearInterval(this.kurentoAudio.pingInterval);
    }

    this.kurentoAudio.dispose();
    this.kurentoAudio = null;
  }
};


KurentoManager.prototype.shareScreen = function (tag) {
  this.exitScreenShare();
  const obj = Object.create(Kurento.prototype);
  Kurento.apply(obj, arguments);
  this.kurentoScreenshare = obj;
  this.kurentoScreenshare.setScreensharing(tag);
};

KurentoManager.prototype.joinWatchVideo = function (tag) {
  this.exitVideo();
  const obj = Object.create(Kurento.prototype);
  Kurento.apply(obj, arguments);
  this.kurentoVideo = obj;
  this.kurentoVideo.setWatchVideo(tag);
};

KurentoManager.prototype.getFirefoxScreenshareSource = function () {
  return this.kurentoScreenshare.firefoxScreenshareSource;
};

KurentoManager.prototype.getChromeScreenshareSources = function () {
  return this.kurentoScreenshare.chromeScreenshareSources;
};

KurentoManager.prototype.getChromeExtensionKey = function () {
  return this.kurentoScreenshare.chromeExtension;
};


Kurento.prototype.setScreensharing = function (tag) {
  this.mediaCallback = this.startScreensharing.bind(this);
  this.create(tag);
};

Kurento.prototype.create = function (tag) {
  this.setRenderTag(tag);
  this.init();
};

Kurento.prototype.downscaleResolution = function (oldWidth, oldHeight) {
  const factorWidth = this.vid_max_width / oldWidth;
  const factorHeight = this.vid_max_height / oldHeight;
  let width,
    height;

  if (factorWidth < factorHeight) {
    width = Math.trunc(oldWidth * factorWidth);
    height = Math.trunc(oldHeight * factorWidth);
  } else {
    width = Math.trunc(oldWidth * factorHeight);
    height = Math.trunc(oldHeight * factorHeight);
  }

  return { width, height };
};

Kurento.prototype.init = function () {
  const self = this;
  if ('WebSocket' in window) {
    this.ws = new WebSocket(this.wsUrl);

    this.ws.onmessage = this.onWSMessage.bind(this);
    this.ws.onclose = () => {
      kurentoManager.exitScreenShare();
      this.logger.error({ logCode: 'kurentoextension_websocket_close' },
        'WebSocket connection to SFU closed unexpectedly, screenshare/listen only will drop');
      self.onFail('Websocket connection closed');
    };
    this.ws.onerror = (error) => {
      kurentoManager.exitScreenShare();
      this.logger.error({
        logCode: 'kurentoextension_websocket_error',
        extraInfo: { errorMessage: error.name || error.message || 'Unknown error' }
      }, 'Error in the WebSocket connection to SFU, screenshare/listen only will drop');
      self.onFail('Websocket connection error');
    };
    this.ws.onopen = function () {
      self.pingInterval = setInterval(self.ping.bind(self), self.PING_INTERVAL);
      self.mediaCallback();
    };
  } else {
    this.logger.info({ logCode: 'kurentoextension_websocket_unsupported'},
      'Browser does not support websockets');
  }
};

Kurento.prototype.onWSMessage = function (message) {
  const parsedMessage = JSON.parse(message.data);
  switch (parsedMessage.id) {
    case 'startResponse':
      this.startResponse(parsedMessage);
      break;
    case 'stopSharing':
      kurentoManager.exitScreenShare();
      break;
    case 'iceCandidate':
      this.handleIceCandidate(parsedMessage.candidate);
      break;
    case 'webRTCAudioSuccess':
      this.onSuccess(parsedMessage.success);
      break;
    case 'webRTCAudioError':
    case 'error':
      this.handleSFUError(parsedMessage);
      break;
    case 'pong':
      break;
    default:
      this.logger.error({
        logCode: 'kurentoextension_unrecognized_sfu_message',
        extraInfo: { sfuResponse: parsedMessage }
      }, `Unrecognized SFU message: ${parsedMessage.id}`);
  }
};

Kurento.prototype.setRenderTag = function (tag) {
  this.renderTag = tag;
};

Kurento.prototype.processIceQueue = function () {
  const peer = this.webRtcPeer;
  while (peer.iceQueue.length) {
    const candidate = peer.iceQueue.shift();
    peer.addIceCandidate(candidate, (error) => {
      if (error) {
        // Just log the error. We can't be sure if a candidate failure on add is
        // fatal or not, so that's why we have a timeout set up for negotiations and
        // listeners for ICE state transitioning to failures, so we won't act on it here
        this.logger.error({
          logCode: 'kurentoextension_addicecandidate_error',
          extraInfo: { errorMessage: error.name || error.message || 'Unknown error' },
        }, `Adding ICE candidate failed due to ${error.message}`);
      }
    });
  }
}

Kurento.prototype.handleIceCandidate = function (candidate) {
  const peer = this.webRtcPeer;
  if (peer.negotiated) {
    peer.addIceCandidate(candidate, (error) => {
      if (error) {
        // Just log the error. We can't be sure if a candidate failure on add is
        // fatal or not, so that's why we have a timeout set up for negotiations and
        // listeners for ICE state transitioning to failures, so we won't act on it here
        this.logger.error({
          logCode: 'kurentoextension_addicecandidate_error',
          extraInfo: { errorMessage: error.name || error.message || 'Unknown error' },
        }, `Adding ICE candidate failed due to ${error.message}`);
      }
    });
  } else {
    // ICE candidates are queued until a SDP answer has been processed.
    // This was done due to a long term iOS/Safari quirk where it'd
    // fail if candidates were added before the offer/answer cycle was completed.
    // IT STILL HAPPENS - prlanzarin sept 2019
    peer.iceQueue.push(candidate);
  }
}

Kurento.prototype.startResponse = function (message) {
  if (message.response !== 'accepted') {
    this.handleSFUError(message);
  } else {
    this.logger.info({
      logCode: 'kurentoextension_start_success',
      extraInfo: { sfuResponse: message }
    }, `Start request accepted for ${message.type}`);

    this.webRtcPeer.processAnswer(message.sdpAnswer, (error) => {
      if (error) {
        this.logger.error({
          logCode: 'kurentoextension_peerconnection_processanswer_error',
          extraInfo: {
            errorMessage: error.name || error.message || 'Unknown error',
          },
        }, `Processing SDP answer from SFU for failed due to ${error.message}`);

        return this.onFail(error);
      }

      this.logger.info({
        logCode: 'kurentoextension_process_answer',
      }, `Answer processed with success`);

      // Mark the peer as negotiated and flush the ICE queue
      this.webRtcPeer.negotiated = true;
      this.processIceQueue();
      // audio calls gets their success callback in a subsequent step (@webRTCAudioSuccess)
      // due to legacy messaging which I don't intend to break now - prlanzarin
      if (message.type === 'screenshare') {
        this.onSuccess()
      }
    });
  }
};

Kurento.prototype.handleSFUError = function (sfuResponse) {
  const { type, code, reason, role } = sfuResponse;
  switch (type) {
    case 'screenshare':
      this.logger.error({
        logCode: 'kurentoextension_screenshare_start_rejected',
        extraInfo: { sfuResponse }
      }, `SFU screenshare rejected by SFU with error ${code} = ${reason}`);

      if (role === this.SEND_ROLE) {
        kurentoManager.exitScreenShare();
      } else if (role === this.RECV_ROLE) {
        kurentoManager.exitVideo();
      }
      break;
    case 'audio':
      this.logger.error({
        logCode: 'kurentoextension_listenonly_start_rejected',
        extraInfo: { sfuResponse }
      }, `SFU listen only rejected by SFU with error ${code} = ${reason}`);

      kurentoManager.exitAudio();
      break;
  }

  this.onFail( { code, reason } );
};

Kurento.prototype.onOfferPresenter = function (error, offerSdp) {
  const self = this;

  if (error) {
    this.logger.error({
      logCode: 'kurentoextension_screenshare_presenter_offer_failure',
      extraInfo: { errorMessage: error.name || error.message || 'Unknown error' },
    }, `Failed to generate peer connection offer for screenshare presenter with error ${error.message}`);
    this.onFail(error);
    return;
  }

  const message = {
    id: 'start',
    type: this.SFU_APP,
    role: this.SEND_ROLE,
    internalMeetingId: self.internalMeetingId,
    voiceBridge: self.voiceBridge,
    callerName: self.userId,
    sdpOffer: offerSdp,
    vh: this.height,
    vw: this.width,
    userName: self.userName,
  };

  this.logger.info({
    logCode: 'kurentoextension_screenshare_request_start_presenter' ,
    extraInfo: { sfuRequest: message },
  }, `Screenshare presenter offer generated. Sending start request to SFU`);

  this.sendMessage(message);
};


Kurento.prototype.startScreensharing = function () {
  if (window.chrome) {
    if (this.chromeExtension == null && !hasDisplayMedia) {
      this.logger.error({ logCode: "kurentoextension_screenshare_noextensionkey" },
        'Screenshare hasnt got a Chrome extension key configured',
      );
      // TODO error handling here
      this.onFail();
      return;
    }
  }

  const options = {
    localVideo: document.getElementById(this.renderTag),
    onicecandidate: (candidate) => {
      this.onIceCandidate(candidate, this.SEND_ROLE);
    },
    sendSource: 'desktop',
    videoStream: this.stream || undefined,
  };

  let resolution;
  this.logger.debug({ logCode: 'kurentoextension_screenshare_screen_dimensions'},
    `Screenshare screen dimensions are ${this.width} x ${this.height}`);
  if (this.width > this.vid_max_width || this.height > this.vid_max_height) {
    resolution = this.downscaleResolution(this.width, this.height);
    this.width = resolution.width;
    this.height = resolution.height;
    this.logger.info({ logCode: 'kurentoextension_screenshare_track_resize' },
      `Screenshare track dimensions have been resized to ${this.width} x ${this.height}`);
  }

  this.addIceServers(this.iceServers, options);

  this.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, (error) => {
    if (error) {
      this.logger.error({
        logCode: 'kurentoextension_screenshare_peerconnection_create_error',
        extraInfo: { errorMessage: error.name || error.message || 'Unknown error' },
      }, `WebRTC peer constructor for screenshare (presenter) failed due to ${error.message}`);
      this.onFail(error);
      return kurentoManager.exitScreenShare();
    }

    this.webRtcPeer.iceQueue = [];
    this.webRtcPeer.generateOffer(this.onOfferPresenter.bind(this));

    const localStream = this.webRtcPeer.peerConnection.getLocalStreams()[0];
    const _this = this;
    localStream.getVideoTracks()[0].onended = function () {
      _this.webRtcPeer.peerConnection.oniceconnectionstatechange = null;
      return kurentoManager.exitScreenShare();
    };

    localStream.getVideoTracks()[0].oninactive = function () {
      return kurentoManager.exitScreenShare();
    };
  });
  this.webRtcPeer.peerConnection.oniceconnectionstatechange = () => {
    if (this.webRtcPeer) {
      const iceConnectionState = this.webRtcPeer.peerConnection.iceConnectionState;
      if (iceConnectionState === 'failed' || iceConnectionState === 'closed') {
        this.webRtcPeer.peerConnection.oniceconnectionstatechange = null;
        this.logger.error({
          logCode: 'kurentoextension_screenshare_presenter_ice_failed',
          extraInfo: { iceConnectionState }
        }, `WebRTC peer for screenshare presenter failed due to ICE transitioning to ${iceConnectionState}`);
        this.onFail({ message: 'iceConnectionStateError', code: 1108 });
      }
    }
  };
};

Kurento.prototype.onIceCandidate = function (candidate, role) {
  const self = this;
  this.logger.debug({
    logCode: 'kurentoextension_screenshare_client_candidate',
    extraInfo: { candidate }
  }, `Screenshare client-side candidate generated: ${JSON.stringify(candidate)}`);

  const message = {
    id: this.ON_ICE_CANDIDATE_MSG,
    role,
    type: this.SFU_APP,
    voiceBridge: self.voiceBridge,
    candidate,
    callerName: self.userId,
  };

  this.sendMessage(message);
};

Kurento.prototype.setWatchVideo = function (tag) {
  this.useVideo = true;
  this.useCamera = 'none';
  this.useMic = 'none';
  this.mediaCallback = this.viewer;
  this.create(tag);
};

Kurento.prototype.viewer = function () {
  const self = this;
  if (!this.webRtcPeer) {
    const options = {
      mediaConstraints: {
        audio: false,
      },
      onicecandidate: (candidate) => {
        this.onIceCandidate(candidate, this.RECV_ROLE);
      },
    };

    this.addIceServers(this.iceServers, options);

    self.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function (error) {
      if (error) {
        return self.onFail(error);
      }
      self.webRtcPeer.iceQueue = [];
      this.generateOffer(self.onOfferViewer.bind(self));
    });
    self.webRtcPeer.peerConnection.oniceconnectionstatechange = () => {
      if (this.webRtcPeer) {
        const iceConnectionState = this.webRtcPeer.peerConnection.iceConnectionState;
        if (iceConnectionState === 'failed' || iceConnectionState === 'closed') {
          this.webRtcPeer.peerConnection.oniceconnectionstatechange = null;
          this.logger.error({
            logCode: 'kurentoextension_screenshare_viewer_ice_failed',
            extraInfo: { iceConnectionState }
          }, `WebRTC peer for screenshare viewer failed due to ICE transitioning to ${iceConnectionState}`);
          this.onFail({ message: 'iceConnectionStateError', code: 1108 });
        }
      }
    };
  }
};

Kurento.prototype.onOfferViewer = function (error, offerSdp) {
  const self = this;
  if (error) {
    this.logger.error({
      logCode: 'kurentoextension_screenshare_viewer_offer_failure',
      extraInfo: { errorMessage: error.name || error.message || 'Unknown error' },
    }, `Failed to generate peer connection offer for screenshare viewer with error ${error.message}`);

    return this.onFail(error);
  }

  const message = {
    id: 'start',
    type: this.SFU_APP,
    role: this.RECV_ROLE,
    internalMeetingId: self.internalMeetingId,
    voiceBridge: self.voiceBridge,
    callerName: self.userId,
    sdpOffer: offerSdp,
    userName: self.userName,
  };

  this.logger.info({
    logCode: 'kurentoextension_screenshare_request_start_viewer',
    extraInfo: { sfuRequest: message },
  }, `Screenshare viewer offer generated. Sending start request to SFU`);

  this.sendMessage(message);
};

KurentoManager.prototype.joinAudio = function (tag) {
  this.exitAudio();
  const obj = Object.create(Kurento.prototype);
  Kurento.apply(obj, arguments);
  this.kurentoAudio = obj;
  this.kurentoAudio.setAudio(tag);
};

Kurento.prototype.setAudio = function (tag) {
  this.mediaCallback = this.listenOnly.bind(this);
  this.create(tag);
};

Kurento.prototype.listenOnly = function () {
  if (!this.webRtcPeer) {
    const options = {
      onicecandidate : this.onListenOnlyIceCandidate.bind(this),
      mediaConstraints: {
        audio: true,
        video: false,
      },
    };

    this.addIceServers(this.iceServers, options);

    this.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, (error) => {
      if (error) {
        return this.onFail(error);
      }

      this.webRtcPeer.iceQueue = [];
      this.webRtcPeer.peerConnection.oniceconnectionstatechange = () => {
        if (this.webRtcPeer) {
          const iceConnectionState = this.webRtcPeer.peerConnection.iceConnectionState;

          if (iceConnectionState === 'failed' || iceConnectionState === 'closed') {
            this.webRtcPeer.peerConnection.oniceconnectionstatechange = null;
            this.logger.error({
              logCode: 'kurentoextension_listenonly_ice_failed',
              extraInfo: { iceConnectionState }
            }, `WebRTC peer for listen only failed due to ICE transitioning to ${iceConnectionState}`);
            this.onFail({
              errorCode: 1007,
              errorMessage: `ICE negotiation failed. Current state - ${iceConnectionState}`,
            });
          }
        }
      }

      this.webRtcPeer.generateOffer(this.onOfferListenOnly.bind(this));
    });
  }
};

Kurento.prototype.onListenOnlyIceCandidate = function (candidate) {
  const self = this;
  this.logger.debug({
    logCode: 'kurentoextension_listenonly_client_candidate',
    extraInfo: { candidate }
  }, `Listen only client-side candidate generated: ${JSON.stringify(candidate)}`);

  const message = {
    id: this.ON_ICE_CANDIDATE_MSG,
    type: 'audio',
    role: 'viewer',
    voiceBridge: self.voiceBridge,
    candidate,
  };
  this.sendMessage(message);
};

Kurento.prototype.onOfferListenOnly = function (error, offerSdp) {
  const self = this;
  if (error) {
    this.logger.error({
      logCode: 'kurentoextension_listenonly_offer_failure',
      extraInfo: { errorMessage: error.name || error.message || 'Unknown error' },
    }, `Failed to generate peer connection offer for listen only with error ${error.message}`);

    return this.onFail(error);
  }

  const message = {
    id: 'start',
    type: 'audio',
    role: 'viewer',
    voiceBridge: self.voiceBridge,
    caleeName: self.caleeName,
    sdpOffer: offerSdp,
    userId: self.userId,
    userName: self.userName,
    internalMeetingId: self.internalMeetingId,
  };

  this.logger.info({
    logCode: 'kurentoextension_listenonly_request_start',
    extraInfo: { sfuRequest: message },
  }, "Listen only offer generated. Sending start request to SFU");
  this.sendMessage(message);
};

Kurento.prototype.pauseTrack = function (message) {
  const localStream = this.webRtcPeer.peerConnection.getLocalStreams()[0];
  const track = localStream.getVideoTracks()[0];

  if (track) {
    track.enabled = false;
  }
};

Kurento.prototype.resumeTrack = function (message) {
  const localStream = this.webRtcPeer.peerConnection.getLocalStreams()[0];
  const track = localStream.getVideoTracks()[0];

  if (track) {
    track.enabled = true;
  }
};

Kurento.prototype.addIceServers = function (iceServers, options) {
  if (iceServers && iceServers.length > 0) {
    this.logger.debug({
      logCode: 'kurentoextension_add_iceservers',
      extraInfo: { iceServers }
    }, `Injecting ICE servers into peer creation`);

    options.configuration = {};
    options.configuration.iceServers = iceServers;
  }
};

Kurento.prototype.stop = function () {
  // if (this.webRtcPeer) {
  //  var message = {
  //    id : 'stop',
  //    type : 'screenshare',
  //    voiceBridge: kurentoHandler.voiceBridge
  //  }
  //  kurentoHandler.sendMessage(message);
  //  kurentoHandler.disposeScreenShare();
  // }
};

Kurento.prototype.dispose = function () {
  if (this.webRtcPeer) {
    this.webRtcPeer.dispose();
    this.webRtcPeer = null;
  }
};

Kurento.prototype.ping = function () {
  const message = {
    id: 'ping',
  };
  this.sendMessage(message);
};

Kurento.prototype.sendMessage = function (message) {
  const jsonMessage = JSON.stringify(message);
  this.ws.send(jsonMessage);
};

Kurento.normalizeCallback = function (callback) {
  if (typeof callback === 'function') {
    return callback;
  }
  return function (args) {
    document.getElementById('BigBlueButton')[callback](args);
  };
};


/* Global methods */

// this function explains how to use above methods/objects
window.getScreenConstraints = function (sendSource, callback) {
  let screenConstraints = { video: {}, audio: false };

  // Limiting FPS to a range of 5-10 (5 ideal)
  screenConstraints.video.frameRate = { ideal: 5, max: 10 };

  screenConstraints.video.height = { max: kurentoManager.kurentoScreenshare.vid_max_height };
  screenConstraints.video.width = { max: kurentoManager.kurentoScreenshare.vid_max_width };

  const getChromeScreenConstraints = function (extensionKey) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        extensionKey,
        {
          getStream: true,
          sources: kurentoManager.getChromeScreenshareSources(),
        },
        (response) => {
          resolve(response);
        }
      );
    });
  };

  const getDisplayMediaConstraints = function () {
    // The fine-grained constraints (e.g.: frameRate) are supposed to go into
    // the MediaStream because getDisplayMedia does not support them,
    // so they're passed differently
    kurentoManager.kurentoScreenshare.extensionInstalled = true;
    optionalConstraints.width = { max: kurentoManager.kurentoScreenshare.vid_max_width };
    optionalConstraints.height = { max: kurentoManager.kurentoScreenshare.vid_max_height };
    optionalConstraints.frameRate = { ideal: 5, max: 10 };

    let gDPConstraints = {
      video: true,
      optional: optionalConstraints
    };

    return gDPConstraints;
  };

  const optionalConstraints = [
    { googCpuOveruseDetection: true },
    { googCpuOveruseEncodeUsage: true },
    { googCpuUnderuseThreshold: 55 },
    { googCpuOveruseThreshold: 100 },
    { googPayloadPadding: true },
    { googScreencastMinBitrate: 600 },
    { googHighStartBitrate: true },
    { googHighBitrate: true },
    { googVeryHighBitrate: true },
  ];

  if (isElectron) {
    const sourceId = ipcRenderer.sendSync('screen-chooseSync');
    kurentoManager.kurentoScreenshare.extensionInstalled = true;

    // this statement sets gets 'sourceId" and sets "chromeMediaSourceId"
    screenConstraints.video.chromeMediaSource = { exact: [sendSource] };
    screenConstraints.video.chromeMediaSourceId = sourceId;
    screenConstraints.optional = optionalConstraints;

    return callback(null, screenConstraints);
  }

  if (isChrome) {
    if (!hasDisplayMedia) {
      const extensionKey = kurentoManager.getChromeExtensionKey();
      getChromeScreenConstraints(extensionKey).then((constraints) => {
        if (!constraints) {
          document.dispatchEvent(new Event('installChromeExtension'));
          return;
        }

        const sourceId = constraints.streamId;

        kurentoManager.kurentoScreenshare.extensionInstalled = true;

        // Re-wrap the video constraints into the mandatory object (latest adapter)
        screenConstraints.video = {};
        screenConstraints.video.mandatory = {};
        screenConstraints.video.mandatory.maxFrameRate = 10;
        screenConstraints.video.mandatory.maxHeight = kurentoManager.kurentoScreenshare.vid_max_height;
        screenConstraints.video.mandatory.maxWidth = kurentoManager.kurentoScreenshare.vid_max_width;
        screenConstraints.video.mandatory.chromeMediaSource = sendSource;
        screenConstraints.video.mandatory.chromeMediaSourceId = sourceId;
        screenConstraints.optional = optionalConstraints;

        return callback(null, screenConstraints);
      });
    } else {
      return callback(null, getDisplayMediaConstraints());
    }
  }

  if (isFirefox) {
    const firefoxScreenshareSource = kurentoManager.getFirefoxScreenshareSource();
    screenConstraints.video.mediaSource = firefoxScreenshareSource;
    return callback(null, screenConstraints);
  }

  // Falls back to getDisplayMedia if the browser supports it
  if (hasDisplayMedia) {
    return callback(null, getDisplayMediaConstraints());
  }
};

window.kurentoInitialize = function () {
  if (window.kurentoManager == null || window.KurentoManager === undefined) {
    window.kurentoManager = new KurentoManager();
  }
};

window.kurentoShareScreen = function () {
  window.kurentoInitialize();
  window.kurentoManager.shareScreen.apply(window.kurentoManager, arguments);
};


window.kurentoExitScreenShare = function () {
  window.kurentoInitialize();
  window.kurentoManager.exitScreenShare();
};

window.kurentoWatchVideo = function () {
  window.kurentoInitialize();
  window.kurentoManager.joinWatchVideo.apply(window.kurentoManager, arguments);
};

window.kurentoExitVideo = function () {
  window.kurentoInitialize();
  window.kurentoManager.exitVideo();
};

window.kurentoJoinAudio = function () {
  window.kurentoInitialize();
  window.kurentoManager.joinAudio.apply(window.kurentoManager, arguments);
};

window.kurentoExitAudio = function () {
  window.kurentoInitialize();
  window.kurentoManager.exitAudio();
};

const isFirefox = typeof window.InstallTrigger !== 'undefined';
const isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
const isChrome = !!window.chrome && !isOpera;
const isSafari = navigator.userAgent.indexOf('Safari') >= 0 && !isChrome;
const kurentoHandler = null;
const SEND_ROLE = "send";
const RECV_ROLE = "recv";
const SFU_APP = "screenshare";
const ON_ICE_CANDIDATE_MSG = "onIceCandidate";
const START_MSG = "start";
const START_RESPONSE_MSG = "startResponse";
const PING_INTERVAL = 15000;

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
  // chromeScreenshareSources, firefoxScreenshareSource

  Object.assign(this, options);

  if (this.wsUrl == null) {
    this.defaultPath = 'bbb-webrtc-sfu';
    this.hostName = window.location.hostname;
    this.wsUrl = `wss://${this.hostName}/${this.defaultPath}`;
  }

  if (this.chromeScreenshareSources == null) {
    this.chromeScreenshareSources = ["screen", "window"];
  }

  if (this.firefoxScreenshareSource == null) {
    this.firefoxScreenshareSource = "window";
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


  if (onFail != null) {
    this.onFail = Kurento.normalizeCallback(onFail);
  } else {
    const _this = this;
    this.onFail = function () {
      _this.logError('Default error handler');
    };
  }

  if (onSuccess != null) {
    this.onSuccess = Kurento.normalizeCallback(onSuccess);
  } else {
    var _this = this;
    this.onSuccess = function () {
      _this.logSuccess('Default success handler');
    };
  }
};

this.KurentoManager = function () {
  this.kurentoVideo = null;
  this.kurentoScreenshare = null;
  this.kurentoAudio = null;
};

KurentoManager.prototype.exitScreenShare = function () {
  console.log('  [exitScreenShare] Exiting screensharing');
  if (typeof this.kurentoScreenshare !== 'undefined' && this.kurentoScreenshare) {
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

  if (typeof this.kurentoVideo !== 'undefined' && this.kurentoVideo) {
    this.exitVideo();
  }
};

KurentoManager.prototype.exitVideo = function () {
  console.log('  [exitScreenShare] Exiting screensharing viewing');
  if (typeof this.kurentoVideo !== 'undefined' && this.kurentoVideo) {
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
};

KurentoManager.prototype.exitAudio = function () {
  console.log('  [exitAudio] Exiting listen only audio');
  if (typeof this.kurentoAudio !== 'undefined' && this.kurentoAudio) {
    if (this.kurentoAudio.ws !== null) {
      this.kurentoAudio.ws.onclose = function () {};
      this.kurentoAudio.ws.close();
    }

    this.kurentoAudio.dispose();
    this.kurentoAudio = null;
  }

  if (this.kurentoAudio) {
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
}

KurentoManager.prototype.getChromeScreenshareSources = function () {
  return this.kurentoScreenshare.chromeScreenshareSources;
}

KurentoManager.prototype.getChromeExtensionKey = function () {
  return this.kurentoScreenshare.chromeExtension;
}


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
  let width, height;

  if (factorWidth < factorHeight) {
    width = Math.trunc(oldWidth * factorWidth);
    height = Math.trunc(oldHeight * factorWidth);
  }
  else {
    width = Math.trunc(oldWidth * factorHeight);
    height = Math.trunc(oldHeight * factorHeight);
  }

  return { width, height };
};

Kurento.prototype.init = function () {
  const self = this;
  if ('WebSocket' in window) {
    console.log('this browser supports websockets');
    this.ws = new WebSocket(this.wsUrl);

    this.ws.onmessage = this.onWSMessage.bind(this);
    this.ws.onclose = (close) => {
      kurentoManager.exitScreenShare();
      self.onFail('Websocket connection closed');
    };
    this.ws.onerror = (error) => {
      kurentoManager.exitScreenShare();
      self.onFail('Websocket connection error');
    };
    this.ws.onopen = function () {
      self.pingInterval = setInterval(self.ping.bind(self), PING_INTERVAL);
      self.mediaCallback();
    };
  } else { console.log('this browser does not support websockets'); }
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
      this.webRtcPeer.addIceCandidate(parsedMessage.candidate);
      break;
    case 'webRTCAudioSuccess':
      this.onSuccess(parsedMessage.success);
      break;
    case 'webRTCAudioError':
      this.onFail(parsedMessage.error);
      break;
    case 'pong':
      break;
    default:
      console.error('Unrecognized message', parsedMessage);
  }
};

Kurento.prototype.setRenderTag = function (tag) {
  this.renderTag = tag;
};

Kurento.prototype.startResponse = function (message) {
  if (message.response !== 'accepted') {
    const errorMsg = message.message ? message.message : 'Unknow error';
    console.warn(`Call not accepted for the following reason: ${errorMsg}`);
    switch (message.type) {
      case 'screenshare':
        if (message.role === SEND_ROLE) {
          kurentoManager.exitScreenShare();
        }
        else if (message.role === RECV_ROLE) {
          kurentoManager.exitVideo();
        }
        break;
      case 'audio':
        kurentoManager.exitAudio();
        break;
    }
  } else {
    console.debug(`Procedure for`, message.type, `was accepted with SDP => ${message.sdpAnswer}`);
    this.webRtcPeer.processAnswer(message.sdpAnswer);
  }
};

Kurento.prototype.onOfferPresenter = function (error, offerSdp) {
  const self = this;

  if (error) {
    console.log(`Kurento.prototype.onOfferPresenter Error ${error}`);
    this.onFail(error);
    return;
  }

  const message = {
    id: 'start',
    type: SFU_APP,
    role: SEND_ROLE,
    internalMeetingId: self.internalMeetingId,
    voiceBridge: self.voiceBridge,
    callerName: self.userId,
    sdpOffer: offerSdp,
    vh: this.height,
    vw: this.width,
  };

  console.log(`onOfferPresenter sending to screenshare server => ${JSON.stringify(message, null, 2)}`);
  this.sendMessage(message);
};


Kurento.prototype.startScreensharing = function () {
  if (window.chrome) {
    if (this.chromeExtension == null) {
      this.logError({
        status: 'failed',
        message: 'Missing Chrome Extension key',
      });
      this.onFail();
      return;
    }
  }

  const options = {
    localVideo: document.getElementById(this.renderTag),
    onicecandidate: (candidate) => {
      this.onIceCandidate(candidate, SEND_ROLE);
    },
    sendSource: 'desktop',
  };

  console.log(` Peer options => ${JSON.stringify(options, null, 2)}`);

  let resolution;
  console.debug("Screenshare screen dimensions are", this.width, "x", this.height);
  if (this.width > this.vid_max_width || this.height > this.vid_max_height) {
    resolution = this.downscaleResolution(this.width, this.height);
    this.width = resolution.width;
    this.height = resolution.height;
    console.debug("Screenshare track dimensions have been resized to", this.width, "x", this.height);
  }

  this.addIceServers(this.iceServers, options);

  this.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, (error) => {
    if (error) {
      console.log(`WebRtcPeerSendonly constructor error ${JSON.stringify(error, null, 2)}`);
      this.onFail(error);
      return kurentoManager.exitScreenShare();
    }

    this.webRtcPeer.generateOffer(this.onOfferPresenter.bind(this));
    console.log(`Generated peer offer w/ options ${JSON.stringify(options)}`);

    const localStream = this.webRtcPeer.peerConnection.getLocalStreams()[0];
    localStream.getVideoTracks()[0].onended = function () {
      return kurentoManager.exitScreenShare();
    };

    localStream.getVideoTracks()[0].oninactive = function () {
      return kurentoManager.exitScreenShare();
    };
  });
};

Kurento.prototype.onIceCandidate = function (candidate, role) {
  const self = this;
  console.log(`Local candidate${JSON.stringify(candidate)}`);

  const message = {
    id: ON_ICE_CANDIDATE_MSG,
    role: role,
    type: SFU_APP,
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
        audio: false
      },
      remoteVideo: document.getElementById(this.renderTag),
      onicecandidate: (candidate) => {
        this.onIceCandidate(candidate, RECV_ROLE);
      }
    }

    this.addIceServers(this.iceServers, options);

    self.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function (error) {
      if (error) {
        return self.onFail(error);
      }

      this.generateOffer(self.onOfferViewer.bind(self));
    });
  }
};

Kurento.prototype.onOfferViewer = function (error, offerSdp) {
  const self = this;
  if (error) {
    console.log(`Kurento.prototype.onOfferViewer Error ${error}`);
    return this.onFail();
  }
  const message = {
    id: 'start',
    type: SFU_APP,
    role: RECV_ROLE,
    internalMeetingId: self.internalMeetingId,
    voiceBridge: self.voiceBridge,
    callerName: self.userId,
    sdpOffer: offerSdp,
  };

  console.log(`onOfferViewer sending to screenshare server => ${JSON.stringify(message, null, 2)}`);
  this.sendMessage(message);
};

KurentoManager.prototype.joinAudio = function (tag) {
  this.exitAudio();
  var obj = Object.create(Kurento.prototype);
  Kurento.apply(obj, arguments);
  this.kurentoAudio= obj;
  this.kurentoAudio.setAudio(tag);
};

Kurento.prototype.setAudio = function (tag) {
  this.mediaCallback = this.listenOnly.bind(this);
  this.create(tag);
};

Kurento.prototype.listenOnly = function () {
  var self = this;
  if (!this.webRtcPeer) {
    var options = {
      remoteVideo: document.getElementById(this.renderTag),
      onicecandidate : this.onListenOnlyIceCandidate.bind(this),
      mediaConstraints: {
        audio:true,
        video:false
      }
    }

    this.addIceServers(this.iceServers, options);

    self.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function(error) {
      if(error) {
        return self.onFail(PEER_ERROR);
      }

      this.generateOffer(self.onOfferListenOnly.bind(self));
    });
  }
};

Kurento.prototype.onListenOnlyIceCandidate = function (candidate) {
  let self = this;
  console.debug("[onListenOnlyIceCandidate]", JSON.stringify(candidate));

  var message = {
    id : 'iceCandidate',
    type: 'audio',
    role: 'viewer',
    voiceBridge: self.voiceBridge,
    candidate : candidate,
  }
  this.sendMessage(message);
};

Kurento.prototype.onOfferListenOnly = function (error, offerSdp) {
  let self = this;
  if(error)  {
    console.error("[onOfferListenOnly]", error);
    return this.onFail(SDP_ERROR);
  }

  let message = {
    id : 'start',
    type: 'audio',
    role: 'viewer',
    voiceBridge: self.voiceBridge,
    caleeName: self.caleeName,
    sdpOffer : offerSdp,
    userId: self.userId,
    userName: self.userName,
    internalMeetingId: self.internalMeetingId
  };

  console.debug("[onOfferListenOnly]", JSON.stringify(message, null, 2));
  this.sendMessage(message);
};

Kurento.prototype.pauseTrack = function (message) {
  const localStream = this.webRtcPeer.peerConnection.getLocalStreams()[0];
  const track = localStream.getVideoTracks()[0];

  if (track) {
    track.enabled = false;
  }
}

Kurento.prototype.resumeTrack = function (message) {
  const localStream = this.webRtcPeer.peerConnection.getLocalStreams()[0];
  const track = localStream.getVideoTracks()[0];

  if (track) {
    track.enabled = true;
  }
}

Kurento.prototype.addIceServers = function (iceServers, options) {
  console.debug("Adding iceServers", iceServers);
  if (iceServers && iceServers.length > 0) {
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
    id: 'ping'
  };
  this.sendMessage(message);
}

Kurento.prototype.sendMessage = function (message) {
  const jsonMessage = JSON.stringify(message);
  console.log(`Sending message: ${jsonMessage}`);
  this.ws.send(jsonMessage);
};

Kurento.prototype.logger = function (obj) {
  console.log(obj);
};

Kurento.prototype.logError = function (obj) {
  console.error(obj);
};


Kurento.normalizeCallback = function (callback) {
  if (typeof callback === 'function') {
    return callback;
  }
  console.log(document.getElementById('BigBlueButton')[callback]);
  return function (args) {
    document.getElementById('BigBlueButton')[callback](args);
  };
};

/* Global methods */

// this function explains how to use above methods/objects
window.getScreenConstraints = function (sendSource, callback) {
  const screenConstraints = { video: {}, audio: false };

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
        },
      );
    });
  };

  if (isChrome) {
    const extensionKey = kurentoManager.getChromeExtensionKey();
    getChromeScreenConstraints(extensionKey).then((constraints) => {
      if (!constraints) {
        document.dispatchEvent(new Event('installChromeExtension'));
        return;
      }

      const sourceId = constraints.streamId;

      kurentoManager.kurentoScreenshare.extensionInstalled = true;

      // this statement sets gets 'sourceId" and sets "chromeMediaSourceId"
      screenConstraints.video.chromeMediaSource = { exact: [sendSource] };
      screenConstraints.video.chromeMediaSourceId = sourceId;
      screenConstraints.optional = [
        { googCpuOveruseDetection: true },
        { googCpuOveruseEncodeUsage: true },
        { googCpuUnderuseThreshold: 55 },
        { googCpuOveruseThreshold: 100},
        { googPayloadPadding: true },
        { googScreencastMinBitrate: 600 },
        { googHighStartBitrate: true },
        { googHighBitrate: true },
        { googVeryHighBitrate: true }
      ];

      console.log('getScreenConstraints for Chrome returns => ', screenConstraints);
      return callback(null, screenConstraints);
    });
  }

  if (isFirefox) {
    const firefoxScreenshareSource = kurentoManager.getFirefoxScreenshareSource();
    screenConstraints.video.mediaSource = firefoxScreenshareSource;

    console.log('getScreenConstraints for Firefox returns => ', screenConstraints);
    return callback(null, screenConstraints);
  }

  if (isSafari) {
    // At this time (version 11.1), Safari doesn't support screenshare.
    document.dispatchEvent(new Event('safariScreenshareNotSupported'));
    return;
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


// a function to check whether the browser (Chrome only) is in an isIncognito
// session. Requires 1 mandatory callback that only gets called if the browser
// session is incognito. The callback for not being incognito is optional.
// Attempts to retrieve the chrome filesystem API.
/* window.checkIfIncognito = function(isIncognito, isNotIncognito = function () {}) {
  isIncognito = Kurento.normalizeCallback(isIncognito);
  isNotIncognito = Kurento.normalizeCallback(isNotIncognito);

  var fs = window.RequestFileSystem || window.webkitRequestFileSystem;
  if (!fs) {
    isNotIncognito();
    return;
  }
  fs(window.TEMPORARY, 100, function(){isNotIncognito()}, function(){isIncognito()});
};

window.checkChromeExtInstalled = function (callback, chromeExtensionId) {
  callback = Kurento.normalizeCallback(callback);

  if (typeof chrome === "undefined" || !chrome || !chrome.runtime) {
    // No API, so no extension for sure
    callback(false);
    return;
  }
  chrome.runtime.sendMessage(
    chromeExtensionId,
    { getVersion: true },
    function (response) {
      if (!response || !response.version) {
        // Communication failure - assume that no endpoint exists
        callback(false);
        return;
      }
      callback(true);
    }
  );
}*/

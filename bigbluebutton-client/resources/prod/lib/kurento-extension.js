var isFirefox = typeof window.InstallTrigger !== 'undefined';
var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
var isChrome = !!window.chrome && !isOpera;
var kurentoHandler = null;

Kurento = function (
    tag,
    voiceBridge,
    conferenceUsername,
    internalMeetingId,
    onFail = null,
    chromeExtension = null) {

  this.ws = null;
  this.video;
  this.screen;
  this.webRtcPeer;
  this.extensionInstalled = false;
  this.screenConstraints = {};
  this.mediaCallback = null;
  voiceBridge += "-DESKSHARE";

  this.vid_width = window.screen.width;
  this.vid_height = window.screen.height;

  this.sessid = Math.random().toString();

  this.renderTag = 'remote-media';

  this.destination_number = internalMeetingId;
  this.caller_id_name = conferenceUsername;
  this.caller_id_number = conferenceUsername;
  this.pingInterval;

  this.kurentoPort = "kurento-screenshare";
  this.hostName = window.location.hostname;
  this.socketUrl = 'wss://' + this.hostName + '/' + this.kurentoPort;

  this.iceServers = null;

  if (chromeExtension != null) {
    this.chromeExtension = chromeExtension;
  }

  if (onFail != null) {
    this.onFail = onFail;
  } else {
    var _this = this;
    this.onFail = function () {
      _this.logError('Default error handler');
    };
  }
};

this.KurentoManager= function () {
  this.kurentoVideo = null;
  this.kurentoScreenShare = null;
};

KurentoManager.prototype.exitScreenShare = function () {
  console.log("exitScreenShare");
  if (this.kurentoScreenShare != null) {
    if(kurentoHandler.pingInterval) {
      clearInterval(kurentoHandler.pingInterval);
    }
    if(kurentoHandler.ws !== null) {
      kurentoHandler.ws.onclose = function(){};
      kurentoHandler.ws.close();
    }
    console.log('Hanging up kurentoScreenShare');
    kurentoHandler.disposeScreenShare();
    this.kurentoScreenShare = null;
    kurentoHandler = null;
  }
};

KurentoManager.prototype.shareScreen = function (tag) {
  console.log("shareScreen");
  this.exitScreenShare();
  var obj = Object.create(Kurento.prototype);
  Kurento.apply(obj, arguments);
  console.log(JSON.stringify(obj, null, 2));
  this.kurentoScreenShare = obj;
  kurentoHandler = obj;
  this.kurentoScreenShare.setScreenShare(tag);
};

// Still unused, part of the HTMl5 implementation
KurentoManager.prototype.joinWatchVideo = function (tag) {
  this.exitVideo();
  var obj = Object.create(Kurento.prototype);
  Kurento.apply(obj, arguments);
  this.kurentoVideo = obj;
  kurentoHandler = obj;
  this.kurentoVideo.setWatchVideo(tag);
};


Kurento.prototype.setScreenShare = function (tag) {
  console.log('setScreenShare  ' + tag);
  this.mediaCallback = this.makeShare;
  this.create(tag);
};

Kurento.prototype.create = function (tag) {
  this.setRenderTag(tag);
  this.iceServers = true;
  this.init();
};

Kurento.prototype.init = function () {
  var self = this;
  if("WebSocket" in window) {
    console.log("this browser supports websockets");
    this.ws = new WebSocket(this.socketUrl);
    console.log(JSON.stringify(this, null, 2));

    this.ws.onmessage = this.onWSMessage;
    this.ws.onclose = function (close) {
      kurentoManager.exitScreenShare();
      console.log("TODO WS onclose");
    };
    this.ws.onerror = function (error) {
      kurentoManager.exitScreenShare();
      console.log("TODO WS error");
    };
    this.ws.onopen = function() {
      self.pingInterval = setInterval(self.ping, 3000);
      self.mediaCallback();
    };
  }
  else
    console.log("this browser does not support websockets");
};



Kurento.prototype.doShare = function (screenConstraints) {
  console.log("doShare");
  var _this = this;
  this.webRtcPeer.generateOffer(this.onOfferPresenter);
};

Kurento.prototype.onWSMessage = function (message) {
  var parsedMessage = JSON.parse(message.data);
  switch (parsedMessage.id) {

    case 'presenterResponse':
      kurentoHandler.presenterResponse(parsedMessage);
      break;
    case 'stopSharing':
      kurentoManager.exitScreenShare();
      break;
    case 'iceCandidate':
      kurentoHandler.webRtcPeer.addIceCandidate(parsedMessage.candidate);
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


Kurento.prototype.presenterResponse = function (message) {
  if (message.response != 'accepted') {
    var errorMsg = message.message ? message.message : 'Unknow error';
    console.warn('Call not accepted for the following reason: ' + errorMsg);
    kurentoManager.exitScreenShare();
  } else {
    console.log("Presenter call was accepted with SDP => " + message.sdpAnswer);
    this.webRtcPeer.processAnswer(message.sdpAnswer);
  }
}

Kurento.prototype.serverResponse = function (message) {
  if (message.response != 'accepted') {
    var errorMsg = message.message ? message.message : 'Unknow error';
    console.warn('Call not accepted for the following reason: ' + errorMsg);
    kurentoHandler.dispose();
  } else {
    this.webRtcPeer.processAnswer(message.sdpAnswer);
  }
}

Kurento.prototype.makeShare = function() {
  var self = this;
  console.log("Kurento.prototype.makeShare " + JSON.stringify(this.webRtcPeer, null, 2));
  if (!this.webRtcPeer) {

    var options = {
      onicecandidate : this.onIceCandidate
    }

    console.log("Peer options " + JSON.stringify(options, null, 2));

    kurentoHandler.startScreenStreamFrom();

  }
}

Kurento.prototype.onOfferPresenter = function (error, offerSdp) {
  if(error)  {
    console.log("Kurento.prototype.onOfferPresenter Error " + error);
    //return onError(error);
    return;
  }
  var message = {
    id : 'presenter',
    presenterId : kurentoHandler.sessid,
    callerName : kurentoHandler.caller_id_name,
    voiceBridge : kurentoHandler.destination_number,
    sdpOffer : offerSdp,
    vh: kurentoHandler.vid_height,
    vw: kurentoHandler.vid_width
  };
  console.log("onOfferPresenter sending to screenshare server => " + JSON.stringify(message, null, 2));
  kurentoHandler.sendMessage(message);
}

Kurento.prototype.startScreenStreamFrom = function () {
  console.log("Kurento.startScreenStreamFrom");
  var screenInfo = null;
  var _this = this;
  if (!!window.chrome) {
    if (!_this.chromeExtension) {
      _this.logError({
        status:  'failed',
        message: 'Missing Chrome Extension key',
      });
      _this.onFail();
      return;
    }
  }
  // TODO it would be nice to check those constraints
  _this.screenConstraints.video = {};

  var options = {
    //localVideo: this.renderTag,
    onicecandidate : _this.onIceCandidate,
    mediaConstraints : _this.screenConstraints,
    sendSource : 'desktop'
  };

  console.log(" Peer options => " + JSON.stringify(options, null, 2));

  _this.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function(error) {
    if(error)  {
      console.log("WebRtcPeerSendonly constructor error " + JSON.stringify(error, null, 2));
      //return onError(error);
      return kurentoManager.exitScreenShare();
    }
    console.log("Generated peer offer w/ options "  + JSON.stringify(options));
    _this.doShare(constraints);
  });
}

Kurento.prototype.onIceCandidate = function(candidate) {
  console.log('Local candidate' + JSON.stringify(candidate));

  var message = {
    id : 'onIceCandidate',
    presenterId : kurentoHandler.sessid,
    candidate : candidate
  }
  console.log("this object " + JSON.stringify(this, null, 2));
  kurentoHandler.sendMessage(message);
}

Kurento.prototype.setWatchVideo = function (tag) {
  this.useVideo = true;
  this.useCamera = 'none';
  this.useMic = 'none';
  this.mediaCallback = this.viewer;
  this.create(tag);
};

Kurento.prototype.viewer = function () {
  var self = this;
  if (!this.webRtcPeer) {

    var options = {
      remoteVideo: this.renderTag,
      onicecandidate : onIceCandidate
    }

    webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function(error) {
      if(error) return onError(error);

      this.generateOffer(onOfferViewer);
    });
  }
};

Kurento.prototype.onOfferViewer = function (error, offerSdp) {
  if(error)  {
    console.log("Kurento.prototype.onOfferViewer Error " + error);
    //return onError(error);
    return;
  }
  var message = {
    id : 'viewer',
    presenterId : kurentoHandler.sessid,
    callerName : kurentoHandler.caller_id_name,
    voiceBridge : kurentoHandler.destination_number,
    sdpOffer : offerSdp
  };

  console.log("onOfferViewer sending to screenshare server => " + JSON.stringify(message, null, 2));
  kurentoHandler.sendMessage(message);
};

Kurento.prototype.ping = function() {
   var message = {
    id : 'ping',
    presenterId : kurentoHandler.sessid,
    callerName : kurentoHandler.caller_id_name,
    voiceBridge : kurentoHandler.destination_number,
  };

  kurentoHandler.sendMessage(message);
}

Kurento.prototype.stop = function() {
  if (this.webRtcPeer) {
    var message = {
      id : 'stop',
      presenterId : kurentoHandler.sessId,
    }
    kurentoHandler.sendMessage(message);
    kurentoHandler.disposeScreenShare();
  }
}

Kurento.prototype.dispose = function() {
  if (this.webRtcPeer) {
    this.webRtcPeer.dispose();
    this.webRtcPeer = null;
  }
}

Kurento.prototype.disposeScreenShare = function() {
  if (this.webRtcPeer) {
    this.webRtcPeer.dispose();
    this.webRtcPeer = null;
  }
}

Kurento.prototype.sendMessage = function(message) {
  var jsonMessage = JSON.stringify(message);
  console.log('Sending message: ' + jsonMessage);
  this.ws.send(jsonMessage);
}

Kurento.prototype.logger = function (obj) {
  console.log(obj);
};

Kurento.prototype.logError = function (obj) {
  console.error(obj);
};

Kurento.prototype.getChromeScreenConstraints = function(callback, extensionId) {
  chrome.runtime.sendMessage(extensionId, {
    getStream: true,
    sources: [
      "window",
      "screen",
      "tab"
    ]},
    function(response) {
      console.log(response);
      callback(response);
    });
};


/* Global methods */

// this function explains how to use above methods/objects
window.getScreenConstraints = function(sendSource, callback) {
  var _this = this;
  var chromeMediaSourceId = sendSource;
  if(isChrome) {
    kurentoHandler.getChromeScreenConstraints (function (constraints) {

      var sourceId = constraints.streamId;

      // this statement sets gets 'sourceId" and sets "chromeMediaSourceId"
      kurentoHandler.screenConstraints.video.chromeMediaSource = { exact: [sendSource]};
      kurentoHandler.screenConstraints.video.chromeMediaSourceId= sourceId;
      console.log("getScreenConstraints for Chrome returns => " +JSON.stringify(kurentoHandler.screenConstraints, null, 2));
      // now invoking native getUserMedia API
      callback(null, kurentoHandler.screenConstraints);

    }, kurentoHandler.chromeExtension);
  }
  else if (isFirefox) {
    kurentoHandler.screenConstraints.video.mediaSource= "screen";
    kurentoHandler.screenConstraints.video.width= {max: kurentoHandler.vid_width};
    kurentoHandler.screenConstraints.video.height = {max:  kurentoHandler.vid_height};

    console.log("getScreenConstraints for Firefox returns => " +JSON.stringify(kurentoHandler.screenConstraints, null, 2));
    // now invoking native getUserMedia API
    callback(null, kurentoHandler.screenConstraints);
  }
}

window.kurentoInitialize = function () {
  if (window.kurentoManager == null || window.KurentoManager == undefined) {
    window.kurentoManager = new KurentoManager();
  }
};

window.kurentoShareScreen = function() {
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

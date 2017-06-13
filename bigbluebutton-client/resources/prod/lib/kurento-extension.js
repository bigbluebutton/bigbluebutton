var isFirefox = typeof window.InstallTrigger !== 'undefined';
var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
var isChrome = !!window.chrome && !isOpera;
var kurentoHandler = null;

/* prototypal code above, real shit below */
Kurento = function (
    tag,
    voiceBridge,
    conferenceUsername,
    userCallback,
    onFail = null,
    chromeExtension = null) {

  this.ws = null;
  this.video;
  this.screen;
  this.webRtcPeer;
  this.chromeMediaSource = 'screen';
  this.extensionInstalled = false;
  this.screenConstraints = {};

  voiceBridge += "-DESKSHARE";

  this.vid_width = window.screen.width;
  this.vid_height = window.screen.height;

  this.sessid = Math.random().toString();

  this.renderTag = 'remote-media';

  this.destination_number = voiceBridge;
  this.caller_id_name = conferenceUsername;
  this.caller_id_number = conferenceUsername;

  this.kurentoPort = "kurento-screenshare";
  this.hostName = window.location.hostname;
  this.socketUrl = 'wss://' + this.hostName + '/' + this.kurentoPort;

  this.iceServers = null;

  // TODO 
  this.userCallback = userCallback;

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

Kurento.prototype.setScreenShare = function (tag) {
  console.log('setScreenShare  ' + tag);
  this.create(tag);
};

Kurento.prototype.create = function (tag) {
  this.setRenderTag(tag);
  //this.configStuns(this.init);
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
      console.log("TODO WS onclose");
    };
    this.ws.onerror = function (error) {
      console.log("TODO WS error");
    };
    this.ws.onopen = function() {
      self.makeShare();
    };
  }
  else
    console.log("this browser does not support websockets");
};


window.kurentoInitialize = function () {
  console.log("kurentoInitialize");
  if (window.kurentoManager == null || window.KurentoManager == undefined) {
    window.kurentoManager = new KurentoManager();
  }
};

window.kurentoShareScreen = function() {
  console.log("window.kurentoShareScreen");
  window.kurentoInitialize();
  window.kurentoManager.shareScreen.apply(window.kurentoManager, arguments);
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
      kurentoHandler.dispose();
      break;
    case 'iceCandidate':
      kurentoHandler.webRtcPeer.addIceCandidate(parsedMessage.candidate)
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
    dispose();
  } else {
    console.log("Presenter call was accepted with SDP => " + message.sdpAnswer);
    this.webRtcPeer.processAnswer(message.sdpAnswer);
  }
}

Kurento.prototype.serverResponse = function (message) {
  if (message.response != 'accepted') {
    var errorMsg = message.message ? message.message : 'Unknow error';
    console.warn('Call not accepted for the following reason: ' + errorMsg);
    dispose();
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
    sdpOffer : offerSdp
  };
  console.log("onOfferPresenter sending to screenshare server => " + JSON.stringify(message, null, 2));
  kurentoHandler.sendMessage(message);
}

//streamId for streaming
Kurento.prototype.startScreenStreamFrom = function () {
  console.log("Kurento.startScreemStreamFrom");
  var screenInfo = null;

  if (!!navigator.mozGetUserMedia) {
    return this.onFail();
  }
  else if (!!window.chrome) {
    var _this = this;

    if (!_this.chromeExtension) {
      _this.logError({
        status:  'failed',
        message: 'Missing Chrome Extension key',
      });
      _this.onFail();
      return;
    }

    // bring up Chrome screen picker
    _this.getMyScreenConstraints(function (constraints) {
      // TODO it would be nice to check those constraints
      //_this.screenConstraints = constraints;
      _this.screenConstraints.audio= 'false';
      _this.screenConstraints.video = {
          width: _this.vid_width,
          height: _this.vid_height
      };

      console.log(JSON.stringify(_this.screenConstraints, null, 2));
      var options = {
        localVideo: _this.renderTag,
        onicecandidate : _this.onIceCandidate,
        //mediaConstraints : _this.screenConstraints,
        //sendSource : 'screen'
      };

      this.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function(error) {
        if(error)  {
          console.log("Kurento.prototype.makeShare Peer Error " + JSON.stringify(error, null, 2));
          return onError(error);
        }
        console.log("Generated peer offer w/ options "  + JSON.stringify(options));
        _this.doShare(constraints);
      });

    }, _this.chromeExtension);
  }
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

Kurento.prototype.stop = function() {
  if (this.webRtcPeer) {
    var message = {
      id : 'stop',
      presenterId : kurentoHandler.sessId,
    }
    kurentoHandler.sendMessage(message);
    dispose();
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

Kurento.prototype.getMyScreenConstraints = function(callback, extensionId) {
  console.log('getting screen constraints');
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

// getScreenConstraints must be defined globally because kurento-utils requires so
window.getScreenConstraints = function(sendSource, callback) {
  console.log('getting screen constraints with =:> ' + kurentoHandler.chromeExtension);
  //  chrome.runtime.sendMessage(kurentoHandler.chromeExtension, {
  //        getStream: true,
  //        sources: [
  //          "window",
  //          "screen",
  //          "tab"
  //        ]},
  //        function(response) {
  //          console.log(response);
  //          callback(response);
  //        });
  callback(null, kurentoHandler.screenConstraints);
};

window.kurentoExitScreenShare = function () {
  window.kurentoInitialize();
  window.kurentoManager.exitScreenShare();
};


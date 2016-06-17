Verto = function (
  voiceBridge,
  conferenceUsername,
  conferenceIdNumber,
  userCallback,
  credentials,
  chromeExtension) {

  this.cur_call = null;
  this.share_call = null;
  this.vertoHandle;

  this.vid_width = 1920;
  this.vid_height = 1080;

  this.local_vid_width = 320;
  this.local_vid_height = 180;
  this.outgoingBandwidth;
  this.incomingBandwidth;
  this.sessid = null;

  this.renderTag = "remote-media";

  this.destination_number = voiceBridge;
  this.caller_id_name = conferenceUsername;
  this.caller_id_number = conferenceIdNumber;

  this.vertoPort = credentials.vertoPort;
  this.hostName = credentials.hostName;
  this.socketUrl = "wss://" + this.hostName + ":" + this.vertoPort;
  this.login = credentials.login;
  this.password = credentials.password;
  this.minWidth = "640";
  this.minHeight = "480";
  this.maxWidth = "1920";
  this.maxHeight = "1080";

  this.useVideo = false;
  this.useCamera = false;
  this.useMic = false;

  this.callWasSuccessful = false;

  this.iceServers = null;

  this.userCallback = userCallback;

  if (chromeExtension != null) {
    this.chromeExtension = chromeExtension;
  }
};

Verto.prototype.logger = function(obj) {
  console.log(obj);
};

Verto.prototype.logError = function(obj) {
  console.error(obj);
};

Verto.prototype.setRenderTag = function(tag) {
  this.renderTag = tag;
};

// receives either a string variable holding the name of an actionscript
// registered callback, or a javascript function object.
// The function will return either the function if it is a javascript Function
// or if it is an actionscript string it will return a javascript Function
// that when invokved will invoke the actionscript registered callback
// and passes along parameters
Verto.prototype.normalizeCallback = function (callback) {
  if (typeof callback == "function") {
    return callback;
  } else {
    return function(args) {
      document.getElementById("BigBlueButton")[callback](args);
    };
  }
};

Verto.prototype.onWSLogin = function(v, success) {
  this.cur_call = null;
  if (success) {
    this.callWasSuccessful = true;
    this.mediaCallback();
  } else {
    // eror logging verto into freeswitch
    this.logError({status: 'failed', errorcode: '10XX'});
    this.callWasSuccessful = false
  }
};

Verto.prototype.registerCallbacks = function () {
  var callbacks = {
    onMessage: function() {},
    onDialogState: function(d) {},
    onWSLogin: this.onWSLogin.bind(this),
    onWSClose: function(v, success) {
      cur_call = null;
      if (this.callWasSuccessful) {
        // the connection was dropped in an already established call
        this.logError('websocket disconnected');
        // WebSocket disconnected
        this.logError({'status':'failed', 'errorcode': 1001});
        toDisplayDisconnectCallback = false;
      } else {
        // this callback was triggered and a call was never successfully established
        this.logError("websocket connection could not be established");
        // Could not make a WebSocket connection
        this.logError({'status':'failed', 'errorcode': 1002});
      }
    }.bind(this),
  };
  this.callbacks = callbacks;
};

Verto.prototype.hold = function () {
  this.cur_call.toggleHold();
};

Verto.prototype.hangup = function () {
  if (this.cur_call) {
    // the duration of the call
    this.logger('call ended ' + this.cur_call.audioStream.currentTime);
  }

  if (this.share_call) {
    // the duration of the call
    this.logger('call ended ' + this.share_call.audioStream.currentTime);
  }

  // the user ended the call themself
  // if (callPurposefullyEnded === true) {
  if (true) {
    this.logger({'status':'ended'});
  } else {
    // Call ended unexpectedly
    this.logError({'status':'failed', 'errorcode': 1005});
  }

  this.vertoHandle.hangup();
  this.cur_call = null;
  this.share_call = null;
};

Verto.prototype.mute = function () {
  this.cur_call.dtmf("0");
};

Verto.prototype.localmute = function () {
  // var muted = cur_call.setMute("toggle");
  // if (muted) {
  //   display("Talking to: " + cur_call.cidString() + " [LOCALLY MUTED]");
  // } else {
  //   display("Talking to: " + cur_call.cidString());
  // }
};

Verto.prototype.localvidmute = function () {
  // var muted = cur_call.setVideoMute("toggle");
  // if (muted) {
  //   display("Talking to: " + cur_call.cidString() + " [VIDEO LOCALLY MUTED]");
  // } else {
  //   display("Talking to: " + cur_call.cidString());
  // }
};

Verto.prototype.vmute = function () {
  this.cur_call.dtmf("*0");
};

Verto.prototype.setWatchVideo = function(tag) {
  this.mediaCallback = this.docall;
  this.useVideo = true;
  this.useCamera = 'none';
  this.useMic = 'none';
  this.create(tag);
};

Verto.prototype.setListenOnly = function(tag) {
  this.mediaCallback = this.docall;
  this.useVideo = false;
  this.useCamera = 'none';
  this.useMic = 'none';
  this.create(tag);
};

Verto.prototype.setMicrophone = function(tag) {
  this.mediaCallback = this.docall;
  this.useVideo = false;
  this.useCamera = 'none';
  this.useMic = 'any';
  this.create(tag);
};

Verto.prototype.setScreenShare = function(tag) {
  this.mediaCallback = this.makeShare;
  this.create(tag);
};

Verto.prototype.create = function(tag) {
  this.setRenderTag(tag);
  this.registerCallbacks();
  // this.configStuns(this.init);
  this.iceServers = true;
  this.init();
};

Verto.prototype.docall = function () {
  if (this.cur_call) {
    this.logger("Quitting: Call already in progress");
    return;
  }

  this.cur_call = this.vertoHandle.newCall({
    destination_number: this.destination_number,
    caller_id_name: this.caller_id_name,
    caller_id_number: this.caller_id_number,
    outgoingBandwidth: this.outgoingBandwidth,
    incomingBandwidth: this.incomingBandwidth,
    useVideo: this.useVideo,
    useStereo: true,
    useCamera: this.useCamera,
    useMic: this.useMic,
    useSpeak: 'any',
    dedEnc: true,
  });
  this.logger(this.cur_call);
};

Verto.prototype.makeShare = function () {
  if (this.share_call) {
    this.logError("Quitting: Call already in progress");
    return;
  }

  var screenInfo = null;
  if (!!navigator.mozGetUserMedia) {
    screenInfo = {
      video: {
        "mozMediaSource": 'window',
        "mediaSource": 'window',
      }
    };
    this.doShare(screenInfo.video);
  } else if (!!window.chrome) {
    var _this = this;
    if (!this.chromeExtension) {
      this.logError({
        'status': 'failed',
        'message': 'Missing Chrome Extension key'
      });
    }

    getChromeExtensionStatus(this.chromeExtension, function(status) {
      if (status != "installed-enabled") {
        this.logError("No chrome Extension");
        return -1;
      }

      // bring up Chrome screen picker
      getScreenConstraints(function(error, screen_constraints) {
        if (error) {
          return this.logError(error);
        }

        screenInfo =  screen_constraints.mandatory;

        this.logger(screenInfo);
        _this.doShare(screenInfo);
      });
    });
  }
};

Verto.prototype.doShare = function (screen_constraints) {
  this.share_call = this.vertoHandle.newCall({
    destination_number: this.destination_number,
    caller_id_name: this.caller_id_name,
    caller_id_number: this.caller_id_number,
    outgoingBandwidth: this.outgoingBandwidth,
    incomingBandwidth: this.incomingBandwidth,
    videoParams: screen_constraints,
    useVideo: true,
    screenShare: true,
    dedEnc: true,
    mirrorInput: false,
  });
};

Verto.prototype.init = function () {
  this.cur_call = null;

  this.vertoHandle = new $.verto({
    login: this.login,
    passwd: this.password,
    socketUrl: this.socketUrl,
    tag: this.renderTag,
    ringFile: "sounds/bell_ring2.wav",
    sessid: this.sessid,
    videoParams: {
      "minWidth": this.vid_width,
      "minHeight": this.vid_height,
      "maxWidth": this.vid_width,
      "maxHeight": this.vid_height,
      "minFrameRate": 15,
      "vertoBestFrameRate": 30,
    },

    deviceParams: {
      useCamera: false,
      useMic: false,
      useSpeak: 'none',
    },

    audioParams: {
      googAutoGainControl: false,
      googNoiseSuppression: false,
      googHighpassFilter: false,
    },

    iceServers: this.iceServers,
  }, this.callbacks);
};

Verto.prototype.logout = function() {
  this.vertoHandle.logout();
};

Verto.prototype.configStuns = function(callback) {
  this.logger("Fetching STUN/TURN server info for Verto initialization");
  var _this = this;
  var stunsConfig = {};
  $.ajax({
    dataType: 'json',
    url: '/bigbluebutton/api/stuns/'
  }).done(function(data) {
    _this.logger("ajax request done");
    _this.logger(data);
    if(data['response'] && data.response.returncode == "FAILED") {
      _this.logError(data.response.message, {error: true});
      _this.logError({'status':'failed', 'errorcode': data.response.message});
      return;
    }
    stunsConfig['stunServers'] = ( data['stunServers'] ? data['stunServers'].map(function(data) {
      return {'url': data['url']};
    }) : [] );
    stunsConfig['turnServers'] = ( data['turnServers'] ? data['turnServers'].map(function(data) {
      return {
        'urls': data['url'],
        'username': data['username'],
        'credential': data['password']
      };
    }) : [] );
    stunsConfig = stunsConfig['stunServers'].concat(stunsConfig['turnServers']);
    _this.logger("success got stun data, making verto");
    _this.iceServers = stunsConfig;
    callback.apply(_this);
  }).fail(function(data, textStatus, errorThrown) {
    _this.logError({'status':'failed', 'errorcode': 1009});
    return;
  });
};

// checks whether Google Chrome or Firefox have the WebRTCPeerConnection object
Verto.prototype.isWebRTCAvailable = function () {
  return (typeof window.webkitRTCPeerConnection !== 'undefined' || typeof window.mozRTCPeerConnection !== 'undefined');
};

this.VertoManager = function () {
  this.vertoAudio = null;
  this.vertoVideo = null;
  this.vertoScreenShare = null;
};

VertoManager.prototype.exitAudio = function() {
  if (this.vertoAudio != null) {
    this.vertoAudio.hangup();
    this.vertoAudio = null;
  }
};

VertoManager.prototype.exitVideo = function() {
  if (this.vertoVideo != null) {
    this.vertoVideo.hangup();
    this.vertoVideo = null;
  }
};

VertoManager.prototype.exitScreenShare = function() {
  if (this.vertoScreenShare != null) {
    this.vertoScreenShare.hangup();
    this.vertoScreenShare = null;
  }
};

VertoManager.prototype.joinListenOnly = function (
  tag,
  voiceBridge,
  conferenceUsername,
  conferenceIdNumber,
  userCallback,
  credentials) {
  this.exitAudio();
  this.vertoAudio = new Verto(
    voiceBridge,
    conferenceUsername,
    conferenceIdNumber,
    userCallback,
    credentials,
    null // Chrome Extension
  );
  this.vertoAudio.setListenOnly(tag);
};

VertoManager.prototype.joinMicrophone = function (
  tag,
  voiceBridge,
  conferenceUsername,
  conferenceIdNumber,
  userCallback,
  credentials) {
    this.exitAudio();
    this.vertoAudio = new Verto(
      voiceBridge,
      conferenceUsername,
      conferenceIdNumber,
      userCallback,
      credentials,
      null // Chrome Extension
    );
    this.vertoAudio.setMicrophone(tag);
};

VertoManager.prototype.joinWatchVideo = function (
  tag,
  voiceBridge,
  conferenceUsername,
  conferenceIdNumber,
  userCallback,
  credentials) {
    this.exitVideo();
    this.vertoVideo = new Verto(
      voiceBridge,
      conferenceUsername,
      conferenceIdNumber,
      userCallback,
      credentials,
      null // Chrome Extension
    );
    this.vertoVideo.setWatchVideo(tag);
};

VertoManager.prototype.shareScreen = function (
  tag,
  voiceBridge,
  conferenceUsername,
  conferenceIdNumber,
  userCallback,
  credentials,
chromeExtension) {
    // this.exitVideo();
    this.vertoScreenShare = new Verto(
      voiceBridge,
      conferenceUsername,
      conferenceIdNumber,
      userCallback,
      credentials,
      chromeExtension
    );
    this.vertoScreenShare.setScreenShare(tag);
};

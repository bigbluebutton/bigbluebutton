Verto = function (
  tag,
  voiceBridge,
  conferenceUsername,
  userCallback,
  onFail = null,
  chromeExtension = null) {

  voiceBridge += "-DESKSHARE";
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

  this.renderTag = 'remote-media';

  this.destination_number = voiceBridge;
  this.caller_id_name = conferenceUsername;
  this.caller_id_number = conferenceIdNumber;

  this.vertoPort = "8082";
  this.hostName = window.location.hostname;
  this.socketUrl = 'wss://' + this.hostName + ':' + this.vertoPort;
  this.login = "bbbuser";
  this.password = "secret";
  this.minWidth = '640';
  this.minHeight = '480';
  this.maxWidth = '1920';
  this.maxHeight = '1080';

  this.useVideo = false;
  this.useCamera = false;
  this.useMic = false;

  this.callWasSuccessful = false;

  this.iceServers = null;

  this.userCallback = userCallback;

  if (chromeExtension != null) {
    this.chromeExtension = chromeExtension;
  }

  if (onFail != null) {
    this.onFail = Verto.normalizeCallback(onFail);
  } else {
    var _this = this;
    this.onFail = function () {
      _this.logError('Default error handler');
    };
  }
};

Verto.prototype.logger = function (obj) {
  console.log(obj);
};

Verto.prototype.logError = function (obj) {
  console.error(obj);
};

Verto.prototype.setRenderTag = function (tag) {
  this.renderTag = tag;
};

// receives either a string variable holding the name of an actionscript
// registered callback, or a javascript function object.
// The function will return either the function if it is a javascript Function
// or if it is an actionscript string it will return a javascript Function
// that when invokved will invoke the actionscript registered callback
// and passes along parameters
Verto.normalizeCallback = function (callback) {
  if (typeof callback == 'function') {
    return callback;
  } else {
    return function (args) {
      document.getElementById('BigBlueButton')[callback](args);
    };
  }
};

Verto.prototype.onWSLogin = function (v, success) {
  this.cur_call = null;
  if (success) {
    this.callWasSuccessful = true;
    this.mediaCallback();
    return;
  } else {
    // error logging verto into freeswitch
    this.logError({ status: 'failed', errorcode: '10XX' });
    this.callWasSuccessful = false;
    this.onFail();
    return;
  }
};

Verto.prototype.registerCallbacks = function () {
  var callbacks = {
    onMessage: function () {},

    onDialogState: function (d) {},

    onWSLogin: this.onWSLogin.bind(this),

    onWSClose: function (v, success) {
      cur_call = null;
      if (this.callWasSuccessful) {
        // the connection was dropped in an already established call
        this.logError('websocket disconnected');

        // WebSocket disconnected
        this.logError({ status:  'failed', errorcode: 1001 });
        toDisplayDisconnectCallback = false;
      } else {
        // this callback was triggered and a call was never successfully established
        this.logError('websocket connection could not be established');

        // Could not make a WebSocket connection
        this.logError({ status:  'failed', errorcode: 1002 });
        this.onFail();
        return;
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
    this.cur_call.hangup();
    this.cur_call = null;
  }

  if (this.share_call) {
    // the duration of the call
    this.logger('call ended ' + this.share_call.audioStream.currentTime);
    this.share_call.hangup();
    this.share_call = null;
  }

  // the user ended the call themself
  // if (callPurposefullyEnded === true) {
  if (true) {
    this.logger({ status: 'ended' });
  } else {
    // Call ended unexpectedly
    this.logError({ status: 'failed', errorcode: 1005 });
  }
};

Verto.prototype.mute = function () {
  this.cur_call.dtmf('0');
};

Verto.prototype.localmute = function () {
  // var muted = cur_call.setMute('toggle');
  // if (muted) {
  //   display('Talking to: ' + cur_call.cidString() + ' [LOCALLY MUTED]');
  // } else {
  //   display('Talking to: ' + cur_call.cidString());
  // }
};

Verto.prototype.localvidmute = function () {
  // var muted = cur_call.setVideoMute('toggle');
  // if (muted) {
  //   display('Talking to: ' + cur_call.cidString() + ' [VIDEO LOCALLY MUTED]');
  // } else {
  //   display('Talking to: ' + cur_call.cidString());
  // }
};

Verto.prototype.vmute = function () {
  this.cur_call.dtmf('*0');
};

Verto.prototype.setWatchVideo = function (tag) {
  this.mediaCallback = this.docall;
  this.useVideo = true;
  this.useCamera = 'none';
  this.useMic = 'none';
  this.create(tag);
};

Verto.prototype.setListenOnly = function (tag) {
  this.mediaCallback = this.docall;
  this.useVideo = false;
  this.useCamera = 'none';
  this.useMic = 'none';
  this.create(tag);
};

Verto.prototype.setMicrophone = function (tag) {
  this.mediaCallback = this.docall;
  this.useVideo = false;
  this.useCamera = 'none';
  this.useMic = 'any';
  this.create(tag);
};

Verto.prototype.setScreenShare = function (tag) {
  this.mediaCallback = this.makeShare;
  this.create(tag);
};

Verto.prototype.create = function (tag) {
  this.setRenderTag(tag);
  this.registerCallbacks();
  this.configStuns(this.init);
};

Verto.prototype.docall = function () {
  if (this.cur_call) {
    this.logger('Quitting: Call already in progress');
    return;
  }

  this.cur_call = window.vertoHandle.newCall({
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
    tag: this.renderTag,
  });
  this.logger(this.cur_call);
};

Verto.prototype.makeShare = function () {
  if (this.share_call) {
    this.logError('Quitting: Call already in progress');
    return;
  }

  var screenInfo = null;
  if (!!navigator.mozGetUserMedia) {
    screenInfo = {
      video: {
        mozMediaSource: 'window',
        mediaSource: 'window',
      },
    };
    this.doShare(screenInfo.video);
  } else if (!!window.chrome) {
    var _this = this;
    if (!_this.chromeExtension) {
      _this.logError({
        status:  'failed',
        message: 'Missing Chrome Extension key',
      });
      _this.onFail();
      return;
    }

    getChromeExtensionStatus(this.chromeExtension, function (status) {
      if (status != 'installed-enabled') {
        _this.logError('No chrome Extension');
        _this.onFail();
        return -1;
      }

      // bring up Chrome screen picker
      getScreenConstraints(function (error, screenConstraints) {
        if (error) {
          _this.onFail();
          return _this.logError(error);
        }

        screenInfo =  screenConstraints.mandatory;

        _this.logger(screenInfo);
        _this.doShare(screenInfo);
      });
    });
  }
};

Verto.prototype.doShare = function (screenConstraints) {
  this.share_call = window.vertoHandle.newCall({
    destination_number: this.destination_number,
    caller_id_name: this.caller_id_name,
    caller_id_number: this.caller_id_number,
    outgoingBandwidth: this.outgoingBandwidth,
    incomingBandwidth: this.incomingBandwidth,
    videoParams: screenConstraints,
    useVideo: true,
    screenShare: true,
    dedEnc: true,
    mirrorInput: false,
    tag: this.renderTag,
  });
};

Verto.prototype.init = function () {
  this.cur_call = null;

  if (!window.vertoHandle) {
    window.vertoHandle = new $.verto({
      login: this.login,
      passwd: this.password,
      socketUrl: this.socketUrl,
      tag: this.renderTag,
      ringFile: 'sounds/bell_ring2.wav',
      sessid: this.sessid,
      videoParams: {
        minWidth: this.vid_width,
        minHeight: this.vid_height,
        maxWidth: this.vid_width,
        maxHeight: this.vid_height,
        minFrameRate: 15,
        vertoBestFrameRate: 30,
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
  } else {
    this.mediaCallback();
    return;
  }
};

Verto.prototype.configStuns = function (callback) {
  this.logger('Fetching STUN/TURN server info for Verto initialization');
  var _this = this;
  var stunsConfig = {};
  $.ajax({
    dataType: 'json',
    url: '/bigbluebutton/api/stuns/',
  }).done(function (data) {
    _this.logger('ajax request done');
    _this.logger(data);
    if (data.response && data.response.returncode == 'FAILED') {
      _this.logError(data.response.message, { error: true });
      _this.logError({ status: 'failed', errorcode: data.response.message });
      return;
    }

    stunsConfig.stunServers = (data.stunServers ? data.stunServers.map(function (data) {
      return { url: data.url };
    }) : []);

    stunsConfig.turnServers = (data.turnServers ? data.turnServers.map(function (data) {
      return {
        urls: data.url,
        username: data.username,
        credential: data.password,
      };
    }) : []);

    stunsConfig = stunsConfig.stunServers.concat(stunsConfig.turnServers);
    _this.logger('success got stun data, making verto');
    _this.iceServers = stunsConfig;
    callback.apply(_this);
  }).fail(function (data, textStatus, errorThrown) {
    _this.logError({ status: 'failed', errorcode: 1009 });
    _this.onFail();
    return;
  });
};

// checks whether Google Chrome or Firefox have the WebRTCPeerConnection object
Verto.prototype.isWebRTCAvailable = function () {
  return (typeof window.webkitRTCPeerConnection !== 'undefined' ||
    typeof window.mozRTCPeerConnection !== 'undefined');
};

this.VertoManager = function () {
  this.vertoAudio = null;
  this.vertoVideo = null;
  this.vertoScreenShare = null;
  window.vertoHandle = null;
};

Verto.prototype.logout = function () {
  this.exitAudio();
  this.exitVideo();
  this.exitScreenShare();
  window.vertoHandle.logout();
};

VertoManager.prototype.exitAudio = function () {
  if (this.vertoAudio != null) {
    console.log('Hanging up vertoAudio');
    this.vertoAudio.hangup();
    this.vertoAudio = null;
  }
};

VertoManager.prototype.exitVideo = function () {
  if (this.vertoVideo != null) {
    console.log('Hanging up vertoVideo');
    this.vertoVideo.hangup();
    this.vertoVideo = null;
  }
};

VertoManager.prototype.exitScreenShare = function () {
  if (this.vertoScreenShare != null) {
    console.log('Hanging up vertoScreenShare');
    this.vertoScreenShare.hangup();
    this.vertoScreenShare = null;
  }
};

VertoManager.prototype.joinListenOnly = function (tag) {
  this.exitAudio();
  var obj = Object.create(Verto.prototype);
  Verto.apply(obj, arguments);
  this.vertoAudio = obj;
  this.vertoAudio.setListenOnly(tag);
};

VertoManager.prototype.joinMicrophone = function (tag) {
  this.exitAudio();
  var obj = Object.create(Verto.prototype);
  Verto.apply(obj, arguments);
  this.vertoAudio = obj;
  this.vertoAudio.setMicrophone(tag);
};

VertoManager.prototype.joinWatchVideo = function (tag) {
  this.exitVideo();
  var obj = Object.create(Verto.prototype);
  Verto.apply(obj, arguments);
  this.vertoVideo = obj;
  this.vertoVideo.setWatchVideo(tag);
};

VertoManager.prototype.shareScreen = function (tag) {
  this.exitScreenShare();
  var obj = Object.create(Verto.prototype);
  Verto.apply(obj, arguments);
  this.vertoScreenShare = obj;
  this.vertoScreenShare.setScreenShare(tag);
};

window.vertoInitialize = function () {
  if (window.vertoManager == null || window.vertoManager == undefined) {
    window.vertoManager = new VertoManager();
  }
};

window.vertoExitAudio = function () {
  window.vertoInitialize();
  window.vertoManager.exitAudio();
};

window.vertoExitScreenShare = function () {
  window.vertoInitialize();
  window.vertoManager.exitScreenShare();
};

window.vertoJoinListenOnly = function () {
  window.vertoInitialize();
  window.vertoManager.joinListenOnly.apply(window.vertoManager, arguments);
};

window.vertoJoinMicrophone = function () {
  window.vertoInitialize();
  window.vertoManager.joinMicrophone.apply(window.vertoManager, arguments);
};

window.vertoWatchVideo = function () {
  window.vertoInitialize();
  window.vertoManager.joinWatchVideo.apply(window.vertoManager, arguments);
};

window.vertoShareScreen = function () {
  window.vertoInitialize();
  window.vertoManager.shareScreen.apply(window.vertoManager, arguments);
};

window.vertoExtensionGetChromeExtensionStatus = function (extensionid, callback) {
  callback = Verto.normalizeCallback(callback);
  getChromeExtensionStatus(extensionid, callback);
};

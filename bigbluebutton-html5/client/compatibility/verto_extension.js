Verto = function (
  tag,
  voiceBridge,
  conferenceUsername,
  userCallback,
  onFail = null,
  chromeExtension = null,
  stunTurnInfo = null,
  loadingCallback = null) {

  voiceBridge += "-SCREENSHARE";
  this.cur_call = null;
  this.share_call = null;
  this.vertoHandle;

  this.vid_width = Math.max(window.screen.width, 1920);
  this.vid_height = Math.max(window.screen.height, 1080);

  this.outgoingBandwidth = "default";
  this.incomingBandwidth = "default";
  // this.sessid = $.verto.genUUID();
  this.sessid = Math.random().toString();

  this.renderTag = 'remote-media';

  this.destination_number = voiceBridge;
  this.caller_id_name = conferenceUsername;
  this.caller_id_number = conferenceUsername;

  this.vertoPort = "verto";
  this.hostName = window.location.hostname;
  this.socketUrl = 'wss://' + this.hostName + '/' + this.vertoPort;
  this.login = "bbbuser";
  this.password = "secret";

  this.useVideo = false;
  this.useCamera = false;
  this.useMic = false;

  this.callWasSuccessful = false;
  this.shouldConnect = true;
  this.iceServers = stunTurnInfo;
  this.userCallback = userCallback;

  if (loadingCallback != null) {
    this.videoLoadingCallback = Verto.normalizeCallback(loadingCallback);
  } else {
    this.videoLoadingCallback = function() {};
  }

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
    if (!this.shouldConnect) {
      return;
    }

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
    onMessage: function (verto, dialog, msg, data) {

      switch (msg) {
        case $.verto.enum.message.pvtEvent:
          if (data.pvtData) {
            switch (data.pvtData.action) {
              // This client has joined the live array for the conference.
              case "conference-liveArray-join":
                initLiveArray(verto, dialog, data);
                break;
              // This client has left the live array for the conference.
              case "conference-liveArray-part":
                // Some kind of client-side wrapup...
              break;
            }
          }
          break;
      }

    },

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

var initLiveArray = function(verto, dialog, data) {
    // Set up addtional configuration specific to the call.
    window.vertoConf = new $.verto.conf(verto, {
      dialog: dialog,
      hasVid: true,
      laData: data.pvtData,
      // For subscribing to published chat messages.
      chatCallback: function(verto, eventObj) {
        var from = eventObj.data.fromDisplay || eventObj.data.from || 'Unknown';
        var message = eventObj.data.message || '';
      },
    });
    var config = {
      subParams: {
        callID: dialog ? dialog.callID : null
      },
    };
    // Set up the live array, using the live array data received from FreeSWITCH.
    window.liveArray = new $.verto.liveArray(window.vertoHandle, data.pvtData.laChannel, data.pvtData.laName, config);
    // Subscribe to live array changes.
    window.liveArray.onChange = function(liveArrayObj, args) {
      console.log("Call UUID is: " + args.key);
      console.log("Call data is: ", args.data);

      console.log(liveArrayObj);
      console.log(args);

      try {
        switch (args.action) {

          // Initial list of existing conference users.
          case "bootObj":
            break;

          // New user joined conference.
          case "add":
            break;

          // User left conference.
          case "del":
            break;

          // Existing user's state changed (mute/unmute, talking, floor, etc)
          case "modify":
            break;
        }
      } catch (err) {
        console.error("ERROR: " + err);
      }
    };
    // Called if the live array throws an error.
    window.liveArray.onErr = function (obj, args) {
      console.error("Error: ", obj, args);
    };
};

Verto.prototype.hold = function () {
  this.cur_call.toggleHold();
};

Verto.prototype.hangup = function () {
  if (this.cur_call) {
    // the duration of the call
    if (this.cur_call.audioStream) {
      this.logger('call ended ' + this.cur_call.audioStream.currentTime);
    }

    this.cur_call.hangup();
    this.cur_call = null;
  }

  if (this.share_call) {
    if (this.share_call.state == $.verto.enum.state.active) {
      this.shouldConnect = false;
    } else {
      this.shouldConnect = true;
    }

    // the duration of the call
    this.logger('call ended ' + this.share_call.audioStream.currentTime);
    this.share_call.rtc.localStream.getTracks().forEach(track => track.stop());
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
  // required for Verto to know we want to use video
  // tell Verto we want to share webcam so it knows there will be a video stream
  // but instead of a webcam we pass screen constraints
  this.useCamera = 'any';
  this.useMic = 'none';
  this.mediaCallback = this.makeShare;
  this.create(tag);
};

Verto.prototype.create = function (tag) {
  this.setRenderTag(tag);
  this.registerCallbacks();

  // fetch ice information from server
  if (this.iceServers == null) {
    this.configStuns(this.init);
  } else {
    // already have it. proceed with init
    this.init();
  }
};

Verto.prototype.docall = function () {
  if (this.cur_call) {
    this.logger('Quitting: Call already in progress');
    return;
  }

  this.shouldConnect = true;

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
    // no screen parameters for FF, just screenShare: true down below
    screenInfo = {};
    this.doShare(screenInfo);
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

    // bring up Chrome screen picker
    getMyScreenConstraints(function (constraints) {
      if (constraints == null || constraints == "" || constraints.streamId == null || constraints.streamId == "") {
        _this.onFail();
        return _this.logError(constraints);
      }

      screenInfo = {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: constraints.streamId,
      };

      _this.logger(screenInfo);
      _this.doShare(screenInfo);
    }, _this.chromeExtension);
  }
};

Verto.prototype.doShare = function (screenConstraints) {
  this.shouldConnect = true;
  screenConstraints.maxWidth = this.vid_width;
  screenConstraints.maxHeight = this.vid_height;

  this.share_call = window.vertoHandle.newCall({
    destination_number: this.destination_number,
    caller_id_name: this.caller_id_name,
    caller_id_number: this.caller_id_number,
    outgoingBandwidth: "default",
    incomingBandwidth: "default",
    videoParams: screenConstraints,
    useVideo: true,
    screenShare: true,
    dedEnc: true,
    mirrorInput: false,
    tag: this.renderTag,
  });

  var stopSharing = function() {
    console.log("stopSharing");
    this.share_call.hangup();
    this.share_call = null;
  };

  var _this = this;
  // Override onStream callback in $.FSRTC instance
  this.share_call.rtc.options.callbacks.onStream = function (rtc, stream) {
    _this.videoLoadingCallback();

    if (stream) {
      var StreamTrack = stream.getVideoTracks()[0];
      StreamTrack.addEventListener('ended', stopSharing.bind(_this));
    }
  };
};

Verto.prototype.init = function () {
  this.cur_call = null;

  if (!window.vertoHandle) {
    window.vertoHandle = new $.verto({
      useVideo: true,
      login: this.login,
      passwd: this.password,
      socketUrl: this.socketUrl,
      tag: this.renderTag,
      ringFile: 'sounds/bell_ring2.wav',
      sessid: this.sessid,
      videoParams: {
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

  // flash client has api access. html5 user passes array.
  // client provided no stuns and cannot make api calls
  // use defaults in verto and try making a call
  if (BBB.getSessionToken == undefined) {
    // uses defaults
    this.iceServers = true;
    // run init callback
    return callback();
  }

  // TODO: screensharing and audio use this exact same function. Should be
  // moved to a shared library for retrieving stun/turn and just pass 
  // success/fail callbacks
  BBB.getSessionToken(function(sessionToken) {
    $.ajax({
      dataType: 'json',
      url: '/bigbluebutton/api/stuns/',
      data: {sessionToken},
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
  }
};

VertoManager.prototype.exitVideo = function () {
  if (this.vertoVideo != null) {
    console.log('Hanging up vertoVideo');
    this.vertoVideo.hangup();
  }
};

VertoManager.prototype.exitScreenShare = function () {
  if (this.vertoScreenShare != null) {
    console.log('Hanging up vertoScreenShare');
    this.vertoScreenShare.hangup();
  }
};

VertoManager.prototype.joinListenOnly = function (tag) {
  this.exitAudio();

  if (this.vertoAudio == null) {
    var obj = Object.create(Verto.prototype);
    Verto.apply(obj, arguments);
    this.vertoAudio = obj;
  }

  this.vertoAudio.setListenOnly(tag);
};

VertoManager.prototype.joinMicrophone = function (tag) {
  this.exitAudio();

  if (this.vertoAudio == null) {
    var obj = Object.create(Verto.prototype);
    Verto.apply(obj, arguments);
    this.vertoAudio = obj;
  }

  this.vertoAudio.setMicrophone(tag);
};

VertoManager.prototype.joinWatchVideo = function (tag) {
  this.exitVideo();

  if (this.vertoVideo == null) {
    var obj = Object.create(Verto.prototype);
    Verto.apply(obj, arguments);
    this.vertoVideo = obj;
  }

  this.vertoVideo.setWatchVideo(tag);
};

VertoManager.prototype.shareScreen = function (tag) {
  this.exitScreenShare();

  if (this.vertoScreenShare == null) {
    var obj = Object.create(Verto.prototype);
    Verto.apply(obj, arguments);
    this.vertoScreenShare = obj;
  }

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

window.vertoExitVideo = function () {
  window.vertoInitialize();
  window.vertoManager.exitVideo();
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

// a function to check whether the browser (Chrome only) is in an isIncognito
// session. Requires 1 mandatory callback that only gets called if the browser
// session is incognito. The callback for not being incognito is optional.
// Attempts to retrieve the chrome filesystem API.
window.checkIfIncognito = function(isIncognito, isNotIncognito = function () {}) {
  isIncognito = Verto.normalizeCallback(isIncognito);
  isNotIncognito = Verto.normalizeCallback(isNotIncognito);

  var fs = window.RequestFileSystem || window.webkitRequestFileSystem;
  if (!fs) {
    isNotIncognito();
    return;
  }
  fs(window.TEMPORARY, 100, function(){isNotIncognito()}, function(){isIncognito()});
};

window.checkChromeExtInstalled = function (callback, chromeExtensionId) {
  callback = Verto.normalizeCallback(callback);

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
}

window.getMyScreenConstraints = function(theCallback, extensionId) {
  theCallback = Verto.normalizeCallback(theCallback);
  chrome.runtime.sendMessage(extensionId, {
    getStream: true,
    sources: [
      "window",
      "screen",
      "tab"
    ]},
    function(response) {
      console.log(response);
      theCallback(response);
   });
};

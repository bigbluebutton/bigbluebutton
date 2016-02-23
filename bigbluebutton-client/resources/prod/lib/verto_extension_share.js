var deskshareStream = "deskshareStream";
window[deskshareStream] = null;
this.share_call = null;

var configDeskshareFromChrome = function(videoTag, callbacks, extensionId, resolutionConstruction) {
	getChromeExtensionStatus(extensionId, function(status) {
		if (status != "installed-enabled") {
			callbacks.onError({'status': 'failed', 'errorcode': 2001});
			console.error("No chrome Extension");
			return -1;
		}

		getScreenConstraints(function(error, screen_constraints) {
			if(error) {
				callbacks.onError({'status': 'failed', 'errorcode': 2021});
				return console.error(error);
			}

			screen_constraints = resolutionConstruction(screen_constraints);
			window.firefoxDesksharePresent = false;
			doCall(screen_constraints, videoTag, callbacks);
		});
	});
};

var configDeskshareFromChromeHTML5 = function(videoTag, callbacks, extensionId) {
	var resolutionConstruction = function(screen_constraints) {
		console.log("modifying video quality");
		var selectedDeskshareResolution = getChosenDeskshareResolution(); // this is the video profile the user chose
		my_real_size(selectedDeskshareResolution);
		var selectedDeskshareConstraints = getDeskshareConstraintsFromResolution(selectedDeskshareResolution, screen_constraints); // convert to a valid constraints object
		console.log(selectedDeskshareConstraints);
		return selectedDeskshareConstraints.video.mandatory;
	};
	configDeskshareFromChrome(videoTag, callbacks, extensionId, resolutionConstruction);
};

var configDeskshareFromChromeFlash = function(videoTag, callbacks, extensionId) {
	var resolutionConstruction = function(screen_constraints) {
		// BigBlueButton low
		var getDeskshareConstraints = function(constraints) {
			return {
				"audio": false,
				"video": {
					"mandatory": {
						"maxWidth": 160,
						"maxHeight": 120,
						"chromeMediaSource": constraints.mandatory.chromeMediaSource,
						"chromeMediaSourceId": constraints.mandatory.chromeMediaSourceId,
						"minFrameRate": 10,
					},
					"optional": []
				}
			};
		};

		console.log("not modifying video quality");
		var selectedDeskshareConstraints = getDeskshareConstraints(screen_constraints); // convert to a valid constraints object
		console.log(selectedDeskshareConstraints);
		return selectedDeskshareConstraints.video.mandatory;
	};
	configDeskshareFromChrome(videoTag, callbacks, extensionId, resolutionConstruction);
};

var configDeskshareFromFirefox = function(screen_constraints, videoTag, callbacks) {
	window.firefoxDesksharePresent = true;
	var screen_constraints = {
		video: {
			"mozMediaSource": 'window',
			"mediaSource": 'window',
		}
	};
	// register the callback to the window namespace to be available in jquery.FSRTC.js
	window.firefoxDesksharePresentErrorCallback = callbacks.onError;
	doCall(screen_constraints, videoTag, callbacks);
};

var configDeskshareFromFirefoxFlash = function(screen_constraints, videoTag, callbacks) {
	console.log("deskshare from firefox flash");
	configDeskshareFromFirefox(screen_constraints, videoTag, callbacks);
};

var configDeskshareFromFirefoxHTML5 = function(screen_constraints, videoTag, callbacks) {
	console.log("deskshare from firefox html5");
	configDeskshareFromFirefox(screen_constraints, videoTag, callbacks);
};

function endScreenshare(loggingCallback, onSuccess) {
	console.log("endScreenshare");
	if (share_call) {
		console.log("a screenshare call is active. Hanging up");
		share_call.hangup();
		share_call = null;
		onSuccess();
	} else {
		console.log("a screenshare call is NOT active. Doing nothing");
	}
	loggingCallback({'status':'success', 'message': 'screenshare ended'});
}

function startScreenshare(loggingCallback, videoTag, vertoServerCredentials, extensionId, modifyResolution, onSuccess, onFail) {
	if(!isLoggedIntoVerto()) { // start the verto log in procedure
		// runs when the websocket is successfully created
		callbacks.onWSLogin = function(v, success) {
			startScreenshareAfterLogin(loggingCallback, videoTag, extensionId, modifyResolution, onSuccess, onFail);
			loggingCallback({'status':'success', 'message': 'screenshare started'});
			console.log("logged in. starting screenshare");
		}
		// set up verto
		init(window.videoTag, vertoServerCredentials);
	} else {
		console.log("already logged into verto, going straight to making a call");
		startScreenshareAfterLogin(loggingCallback, videoTag, extensionId, modifyResolution, onSuccess, onFail);
		loggingCallback({'status':'success', 'message': 'screenshare started'});
	}
}

function startScreenshareAfterLogin(loggingCallback, videoTag, extensionId, modifyResolution, onSuccess, onFail) {
	if (share_call) {
		return;
	}

	outgoingBandwidth = incomingBandwidth = "default";
	var sharedev = "screen";

	if (sharedev !== "screen") {
		console.log("Attempting Screen Capture with non-screen device....");

		BBB.getMyUserInfo(function (retData){
			share_call = verto.newCall({
				destination_number: retData.voiceBridge + "-screen",
				caller_id_name: retData.myUsername + " (Screen)",
				caller_id_number: retData.myUserID + " (screen)",
				outgoingBandwidth: outgoingBandwidth,
				incomingBandwidth: incomingBandwidth,
				useCamera: sharedev,
				useVideo: true,
				screenShare: true,
				dedEnc: false,
				mirrorInput: false
			});
		});
		return;
	}

	var callbacks = {
		// allows the callback to be invoked whether the name of a registered callback is passed (actionscript)
		// or a JS function is passed
		onError: function(args) {
			if (typeof onFail == "function") {
				onFail(args);
			} else {
				document.getElementById("BigBlueButton").onFail(args);
			}
		},
		onICEComplete: function(self, candidate) { // ICE candidate negotiation is complete
			console.log("custom callback: onICEComplete");
			onSuccess();
		}
	};

	if (!!navigator.mozGetUserMedia) {
		if (modifyResolution) {
			configDeskshareFromFirefoxHTML5(null, videoTag, callbacks);
		} else {
			configDeskshareFromFirefoxFlash(null, videoTag, callbacks);
		}
	} else if (!!window.chrome) {
		if (modifyResolution) {
			configDeskshareFromChromeHTML5(videoTag, callbacks, extensionId);
		} else {
			configDeskshareFromChromeFlash(videoTag, callbacks, extensionId);
		}
	}
}

function doCall(screen_constraints, videoTag, callbacks) {
	console.log("\n\n\nhere are the screen_constraints\n\n\n");
	console.log(screen_constraints);
	window.listenOnly = false;
	window.watchOnly = false;
	window.joinAudio = true;

	BBB.getMyUserInfo(function (retData){
		var callParams = {
			destination_number: retData.voiceBridge + "-screen",
			caller_id_name: retData.myUsername + " (Screen)",
			caller_id_number: retData.myUserID + " (screen)",
			outgoingBandwidth: outgoingBandwidth,
			incomingBandwidth: incomingBandwidth,
			videoParams: screen_constraints,
			useVideo: true,
			screenShare: true,
			dedEnc: true,
			mirrorInput: true,
		};

		if (videoTag != null) {
			callParams.tag = videoTag;
		}
		share_call = verto.newCall(callParams);
		share_call.rtc.options.callbacks = $.extend(share_call.rtc.options.callbacks, callbacks);
	});
}

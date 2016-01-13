var deskshareStream = "deskshareStream";
window[deskshareStream] = null;
this.share_call = null;

function endScreenshare(loggingCallback, onSuccess) {
	if (share_call) {
		share_call.hangup();
		share_call = null;
		onSuccess();
	}
	loggingCallback({'status':'success', 'message': 'screenshare ended'});
}

function startScreenshare(loggingCallback, videoTag, vertoServerCredentials, extensionId, onSuccess, onFail) {
	if(!isLoggedIntoVerto()) { // start the verto log in procedure
		// runs when the websocket is successfully created
		callbacks.onWSLogin = function(v, success) {
			startScreenshare2(loggingCallback, videoTag, extensionId, onSuccess, onFail);
			loggingCallback({'status':'success', 'message': 'screenshare started'});
			console.log("logged in. starting screenshare");
		}
		// set up verto
		init(window.videoTag, vertoServerCredentials);
	} else {
		console.log("already logged into verto, going straight to making a call");
		startScreenshare2(loggingCallback, videoTag, extensionId, onSuccess, onFail);
		loggingCallback({'status':'success', 'message': 'screenshare started'});
	}
}

function startScreenshare2(loggingCallback, videoTag, extensionId, onSuccess, onFail) {
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
		onError: function(vertoErrorObject, errorMessage) {
			console.error("custom callback: onError");
			//
			onFail();
		},
		onICEComplete: function(self, candidate) { // ICE candidate negotiation is complete
			console.log("custom callback: onICEComplete");
			//
			onSuccess();
		}
	};

	if (!!navigator.mozGetUserMedia) {
		var selectedDeskshareResolution = getChosenDeskshareResolution(); // this is the video profile the user chose
		my_real_size(selectedDeskshareResolution);
		var screen_constraints = {
			"mozMediaSource": 'window',
			"mediaSource": 'window',
			"width": 0,
			"height": 0,
			frameRate : {min: 15, max: 30}
		};

		window.listenOnly = false;
		window.watchOnly = false;
		window.joinAudio = true;

		BBB.getMyUserInfo(function (retData){
			share_call = verto.newCall({
				destination_number: retData.voiceBridge + "-screen",
				caller_id_name: retData.myUsername + " (Screen)",
				caller_id_number: retData.myUserID + " (screen)",
				outgoingBandwidth: outgoingBandwidth,
				incomingBandwidth: incomingBandwidth,
				videoParams: screen_constraints,
				useVideo: true,
				screenShare: true,
				dedEnc: false,
				mirrorInput: false,
				tag: "webcam"
			});
		});

		share_call.rtc.options.callbacks = $.extend(share_call.rtc.options.callbacks, callbacks);
	} else {
		getChromeExtensionStatus(extensionId, function(status) {
			getScreenConstraints(function(error, screen_constraints) {
				if(error) {
					return console.error(error);
				}

				console.log("status", status);
				console.log('screen_constraints', screen_constraints);

				var selectedDeskshareResolution = getChosenDeskshareResolution(); // this is the video profile the user chose
				my_real_size(selectedDeskshareResolution);
				var selectedDeskshareConstraints = getDeskshareConstraintsFromResolution(selectedDeskshareResolution, screen_constraints); // convert to a valid constraints object
				console.log(selectedDeskshareConstraints);

				window.listenOnly = false;
				window.watchOnly = false;
				window.joinAudio = true;

				BBB.getMyUserInfo(function (retData){
					share_call = verto.newCall({
						destination_number: retData.voiceBridge + "-screen",
						caller_id_name: retData.myUsername + " (Screen)",
						caller_id_number: retData.myUserID + " (screen)",
						outgoingBandwidth: outgoingBandwidth,
						incomingBandwidth: incomingBandwidth,
						videoParams: selectedDeskshareConstraints.video.mandatory,
						useVideo: true,
						screenShare: true,
						dedEnc: true,
						mirrorInput: true,
						tag: videoTag,
					});
				});

				share_call.rtc.options.callbacks = $.extend(share_call.rtc.options.callbacks, callbacks);
			});
		});
	}
}

// return the webcam resolution that the user has selected
this.getChosenDeskshareResolution = function() {
	var videoConstraints = getAllPresetVideoResolutions(); // retrieve all resolutions
	var selectedVideo = videoConstraints[$("#deskshareResolutions").find(":selected").val()];
	return selectedVideo;
}

// receives a video resolution profile, and converts it into a constraints format for getUserMedia
this.getDeskshareConstraintsFromResolution = function(resolution, constraints) {
	return {
		"audio": false,
		"video": {
			"mandatory": {
				"maxWidth": resolution.constraints.maxWidth,
				"maxHeight": resolution.constraints.maxHeight,
				"chromeMediaSource": constraints.mandatory.chromeMediaSource,
				"chromeMediaSourceId": constraints.mandatory.chromeMediaSourceId,
				"minFrameRate": resolution.constraints.minFrameRate
			},
			"optional": []
		}
	};
}

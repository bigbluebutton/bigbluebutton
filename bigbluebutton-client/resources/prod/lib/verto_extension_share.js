var deskshareStream = "deskshareStream";
window[deskshareStream] = null;
this.share_call = null;

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
		onError: function(vertoErrorObject, errorMessage) {
			console.error("custom callback: onError");
			onFail();
		},
		onICEComplete: function(self, candidate) { // ICE candidate negotiation is complete
			console.log("custom callback: onICEComplete");
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

		doCall(screen_constraints, videoTag, callbacks);
	} else {
		getChromeExtensionStatus(extensionId, function(status) {
			getScreenConstraints(function(error, screen_constraints) {
				if(error) {
					return console.error(error);
				}

				console.log("status", status);
				console.log('screen_constraints', screen_constraints);

				if (modifyResolution) {
					console.log("modifying video quality");
					var selectedDeskshareResolution = getChosenDeskshareResolution(); // this is the video profile the user chose
					my_real_size(selectedDeskshareResolution);
					var selectedDeskshareConstraints = getDeskshareConstraintsFromResolution(selectedDeskshareResolution, screen_constraints); // convert to a valid constraints object
					console.log(selectedDeskshareConstraints);
					screen_constraints = selectedDeskshareConstraints.video.mandatory;
				} else {
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
					}

					console.log("not modifying video quality");
					var selectedDeskshareConstraints = getDeskshareConstraints(screen_constraints); // convert to a valid constraints object
					console.log(selectedDeskshareConstraints);
					screen_constraints = selectedDeskshareConstraints.video.mandatory;
				}

				doCall(screen_constraints, videoTag, callbacks);
			});
		});
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

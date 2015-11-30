function screenStart(state, callback) {
	if (state) {
		if(!isLoggedIntoVerto()) { // start the verto log in procedure
			// runs when the websocket is successfully created
			callbacks.onWSLogin = function(v, success) {
				doshare(state);
				callback({'status':'success', 'message': 'screenshare started'});
				console.log("logged in. starting screenshare");
			}
			// set up verto
			$.verto.init({}, init);
		} else {
			console.log("already logged into verto, going straight to making a call");
			doshare(state);
			callback({'status':'success', 'message': 'screenshare started'});
		}
	} else {
		doshare(state);
		callback({'status':'success', 'message': 'screenshare ended'});
	}
}

function doshare(on) {
	if (!on) {
		if (share_call) {
			share_call.hangup();
		}
		return;
	}

	if (share_call) {
		return;
	}

	outgoingBandwidth = incomingBandwidth = "5120";
	// outgoingBandwidth = incomingBandwidth = "default";
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

	getChromeExtensionStatus( function(status) {
		sourceId = null;
		console.log("status", status);
		getScreenConstraints(function(error, screen_constraints) {
			if(error) {
				return console.error(error);
			}

			console.log('screen_constraints', screen_constraints);

			BBB.getMyUserInfo(function (retData){
				share_call = verto.newCall({
					destination_number: retData.voiceBridge + "-screen",
					caller_id_name: retData.myUsername + " (Screen)",
					caller_id_number: retData.myUserID + " (screen)",
					outgoingBandwidth: outgoingBandwidth,
					incomingBandwidth: incomingBandwidth,
					videoParams: screen_constraints.mandatory,
					useVideo: true,
					screenShare: true,
					dedEnc: true,
					mirrorInput: true
				});
			});
		});
	});
}

function doDesksharePreview() {
	getChromeExtensionStatus(function(status) {
		// sourceId = null; //TODO
		getScreenConstraints(function(error, screen_constraints) {
			if(error) {
				return console.error(error);
			}

			console.log('screen_constraints', screen_constraints);

			navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
			navigator.getUserMedia({ video: screen_constraints }, function(stream) {
				var video = document.querySelector('video');
				video.src = URL.createObjectURL(stream);
				video.play();
			}, function(error) {
				return console.error(JSON.stringify(error, null, '\t'));
			});
		})
	});
}

function vertoScreenStart() {
	console.log("vertoScreenStart");
	// screenStart(true, function () {
	// });
	screenStart(true, function(){});
}

function vertoScreenStop() {
	console.log("vertoScreenStop");
	screenStart(false, function () {
	});
}

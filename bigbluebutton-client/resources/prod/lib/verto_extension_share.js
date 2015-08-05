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
	var sharedev = "screen"; // $("#useshare").find(":selected").val();

	if (sharedev !== "screen") {
		console.log("Attempting Screen Capture with non-screen device....");
		share_call = verto.newCall({
			destination_number: extension + "-screen",
			caller_id_name: conferenceUsername + " (Screen)",
			caller_id_number: conferenceIdNumber + " (screen)",
			outgoingBandwidth: outgoingBandwidth,
			incomingBandwidth: incomingBandwidth,
			useCamera: sharedev,
			useVideo: true,
			screenShare: true,
			dedEnc: false, //$("#use_dedenc").is(':checked'),
			mirrorInput: false //$("#mirror_input").is(':checked')
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

			//var videoParamsCustom = {
			//	maxHeight: 240,
			//	maxWidth: 320,
			//	minFrameRate: 30,
			//	minHeight: 240,
			//	minWidth: 320
			//};

			console.log('screen_constraints', screen_constraints);
			share_call = verto.newCall({
				destination_number: extension + "-screen",
				caller_id_name: conferenceUsername + " (Screen)",
				caller_id_number: conferenceIdNumber + " (screen)",
				outgoingBandwidth: outgoingBandwidth,
				incomingBandwidth: incomingBandwidth,
				//videoParams: videoParamsCustom, //TODOTODO
				videoParams: screen_constraints.mandatory, //TODOTODO
				useVideo: true,
				screenShare: true,
				dedEnc: true,
				mirrorInput: true
			});
		});
	});
}

function doDesksharePreview() {
	getChromeExtensionStatus(function(status) {
		// sourceId = null;
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
	alert("start");
	// screenStart(true, function () {
	// });
}

function vertoScreenStop() {
	alert("stop");
	// screenStart(true, function () {
	// });
}

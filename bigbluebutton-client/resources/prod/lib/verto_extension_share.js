function screenStart(state, callback) {
	console.log("2");
	//var imported = document.createElement('script');
	//imported.src = '/client/lib/verto.js';
	//document.head.appendChild(imported);

	console.log("loggedIn=" + isLoggedIntoVerto());
	if(!isLoggedIntoVerto()) { // start the verto log in procedure
		console.log("aaa");
		// runs when the websocket is successfully created
		callbacks.onWSLogin = function(v, success) {
			cur_call = true;
			console.log("bbbb");
			doshare(state);
			goto_page("main");
			console.log("logged in. starting screenshare");
			// $("#webcam").show()
			// $("#webcam").css("z-index","1000")
		}
		console.log("ccc");
		// set up verto
		$.verto.init({}, init);
	} else {
		console.log("ddddd");
		console.log("already logged into verto, going straight to making a call and state=" + state);
		cur_call = true;
		doshare(true);
		goto_page("main");
		$("#webcam").show()
		$("#webcam").css("z-index","1000")
	}

	console.log("eee" + state);
	if (state) {
		callback({'status':'success', 'message': 'screenshare started'});
	} else {
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

	// $('#ext').trigger('change');
	// $("#main_info").html("Trying");
	check_vid_res();
	outgoingBandwidth = "5120";
	incomingBandwidth = "5120";

	var sharedev = "screen";
	//var sharedev = $("#useshare").find(":selected").val();

	if (sharedev !== "screen") {
		alert("not screen");
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
			dedEnc: false, // $("#use_dedenc").is(':checked'),
			mirrorInput: false //$("#mirror_input").is(':checked')
		});
		return;
	}

	getScreenId(function (error, sourceId, screen_constraints) {
		console.log("Attempting Screen Capture.... when the param 'err' is " + error);

		// TODO anton remove this hardcoded screen_constraints
		//var NEW_screen_constraints = {
		//   audio: false,
		//   video: {
		//       mandatory: {
		//           chromeMediaSource: error ? 'screen' : 'desktop',
		//           maxWidth: window.screen.width > 1920 ? window.screen.width : 1920,
		//           maxHeight: window.screen.height > 1080 ? window.screen.height : 1080
		//       },
		//       optional: []
		//   }
		//};

		//var NEW_screen_constraints = {
		//	audio: false,
		//	video: {
		//		mandatory: {
		//			chromeMediaSource: error ? 'screen' : 'desktop',
		//			maxWidth: window.screen.width > 1920 ? window.screen.width : 320,
		//			maxHeight: window.screen.height > 1080 ? window.screen.height : 240
		//		},
		//		optional: []
		//	}
		//};
		var videoParamsCustom = {
			maxHeight: 240,
			maxWidth: 320,
			minFrameRate: 30,
			minHeight: 240,
			minWidth: 320
		};

		share_call = verto.newCall({
			destination_number: extension + "-screen",
			caller_id_name: conferenceUsername + " (Screen)",
			caller_id_number: conferenceIdNumber + " (screen)",
			// destination_number: extension,
			// caller_id_name: conferenceUsername,
			// caller_id_number: conferenceIdNumber,
			outgoingBandwidth: outgoingBandwidth,
			incomingBandwidth: incomingBandwidth,
			videoParams: videoParamsCustom, //TODO anton
			//videoParams: screen_constraints.video.mandatory, //TODO anton
			useCamera: "screen",
			//useCamera: true,
			useVideo: true,
			screenShare: true,
			dedEnc: false, //true,
			mirrorInput: false, //true,
			tag: "webcam"
		});
	});

}
function vertoScreenStart() {
	alert("start");
	screenStart(true, function(){});
}

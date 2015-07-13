function screenStart(state, callback) {
	alert("2");
	//var imported = document.createElement('script');
	//imported.src = '/client/lib/verto.js';
	//document.head.appendChild(imported);

	if(!isLoggedIntoVerto()) { // start the verto log in procedure
		// runs when the websocket is successfully created
		callbacks.onWSLogin = function(v, success) {
			cur_call = true;
			doshare(state);
			goto_page("main");
			console.log("logged in. starting screenshare");
			$("#webcam").show()
			$("#webcam").css("z-index","1000")
		}
		// set up verto
		$.verto.init({}, init);
	} else {
		console.log("already logged into verto, going straight to making a call");
		cur_call = true;
		doshare(state);
		goto_page("main");
		$("#webcam").show()
		$("#webcam").css("z-index","1000")
	}

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

	$('#ext').trigger('change');
	$("#main_info").html("Trying");
	check_vid_res();
	outgoingBandwidth = "5120";
	incomingBandwidth = "5120";

	var sharedev = $("#useshare").find(":selected").val();

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
			dedEnc: $("#use_dedenc").is(':checked'),
			mirrorInput: $("#mirror_input").is(':checked')
		});
		return;
	}

	getScreenId(function (error, sourceId, screen_constraints) {
		console.log("Attempting Screen Capture....");
		share_call = verto.newCall({
			destination_number: extension + "-screen",
			caller_id_name: conferenceUsername + " (Screen)",
			caller_id_number: conferenceIdNumber + " (screen)",
			// destination_number: extension,
			// caller_id_name: conferenceUsername,
			// caller_id_number: conferenceIdNumber,
			outgoingBandwidth: outgoingBandwidth,
			incomingBandwidth: incomingBandwidth,
			videoParams: screen_constraints.video.mandatory,
			useCamera: true,
			useVideo: true,
			screenShare: true,
			dedEnc: true,
			mirrorInput: true,
			tag: "webcam"
		});
	});

}
function vertoScreenStart() {
	alert("start");
	screenStart(true, function(){});
}

Template.verto.events
	"click #desksharePreview": (event) ->
		doDesksharePreview((->), (->), "webcam");

	"click #getAdjustedResolutions": (event) ->
		getAdjustedResolutions (result) ->
			for i of result
				$("#adjustedResolutions").append(i + ": " + result[i].width + "x" + result[i].height + "<br/>")

	"click #hangUp": (event) ->
		leaveWebRTCVoiceConference_verto();
		cur_call = null;

	"click #joinAudio": (event) ->
		wasCallSuccessful = false
		debuggerCallback = (message) ->
			console.log("CALLBACK: "+JSON.stringify(message));
			#
			# Beginning of hacky method to make Firefox media calls succeed.
			# Always fail the first time. Retry on failure.
			#
			if !!navigator.mozGetUserMedia and message.errorcode is 1001
				callIntoConference_verto(extension, conferenceUsername, conferenceIdNumber, ((m) -> console.log("CALLBACK: "+JSON.stringify(m))), "webcam")
			#
			# End of hacky method
			#
		callIntoConference_verto(extension, conferenceUsername, conferenceIdNumber, debuggerCallback, "webcam");

	"click #shareScreen": (event) ->
		screenStart(true, (->), "webcam");
		$("#shareScreen").hide();
		$("#stopScreen").show();

	"click #stopScreen": (event) ->
		screenStart(false, (->));
		$("#shareScreen").show();
		$("#stopScreen").hide();

	"click #webcamPreview": (event) ->
		doWebcamPreview((->), (->), "webcam");

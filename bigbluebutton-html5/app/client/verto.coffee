Template.vertoDeskshareMenu.events
	"click .vertoButton": (event) ->
		$("#settingsModal").foundation('reveal', 'close')

	"click .screenshareShow": (event) ->
		$("#deskshareModal").foundation('reveal', 'open');
		$("#screenshareShow").hide()
		$("#screenshareHide").show()

	"click .screenshareHide": (event) ->
		if(!!window["deskshareStream"])
			$("#webcam").src = null;
			window["deskshareStream"].stop();
		else
			screenStart(false, (->))

		$("#screenshareShow").show()
		$("#screenshareHide").hide()
		$("#screenshareStart").show()
		$("#screenshareStop").hide()

Template.deskshareModal.events
	"click .screenshareStart": (event) ->
		$("#deskshareModal").foundation('reveal', 'close')
		$("#screenshareStart").hide()
		$("#screenshareStop").show()
		screenStart(true, (->), "webcam")

	"click .screenshareStop": (event) ->
		$("#deskshareModal").foundation('reveal', 'close')
		$("#screenshareStart").show()
		$("#screenshareStop").hide()
		screenStart(false, (->))

	"click #desksharePreview": (event) ->
		doDesksharePreview((->), (->), "webcam");

Template.vertoWebcamMenu.events
	"click .vertoButton": (event) ->
		$("#settingsModal").foundation('reveal', 'close')

	"click .webcamShow": (event) ->
		$("#webcamModal").foundation('reveal', 'open');
		$("#webcamShow").hide()
		$("#webcamHide").show()

	"click .webcamHide": (event) ->
		if(!!window["webcamStream"])
			$("#webcam").src = null;
			window["webcamStream"].stop();

		$("#webcamShow").show()
		$("#webcamHide").hide()

Template.webcamModal.events
	"click .vertoButton": (event) ->
		$("#settingsModal").foundation('reveal', 'close')

	"click .webcamStart": (event) ->
		$("#webcamModal").foundation('reveal', 'open');
		$("#webcamStart").hide()
		$("#webcamStop").show()

	"click .webcamStop": (event) ->
		$("#webcamStart").show()
		$("#webcamStop").hide()

	"click #webcamPreview": (event) ->
		doWebcamPreview((->), (->), "webcam");

	"click #getAdjustedResolutions": (event) ->
		getAdjustedResolutions (result) ->
			for i of result
				$("#adjustedResolutions").append(i + ": " + result[i].width + "x" + result[i].height + "<br/>")

@toggleWhiteboardVideo = (display) ->
	if display is "whiteboard"
		$("#webcam").css("display", "none")
		$("#whiteboard-container").css("display", "block")
	else if display is "video"
		$("#whiteboard-container").css("display", "none")
		$("#webcam").css("display", "block")
		$("#webcam").css("width", "100%")
		$("#webcam").css("height", "100%")








	# "click #hangUp": (event) ->
	# 	leaveWebRTCVoiceConference_verto();
	# 	cur_call = null;

	# "click #joinAudio": (event) ->
	# 	# displayVertoVideo()
	# 	toggleWhiteboardVideo("video")
	# 	# return
	# 	wasCallSuccessful = false
	# 	debuggerCallback = (message) ->
	# 		console.log("CALLBACK: "+JSON.stringify(message));
	# 		#
	# 		# Beginning of hacky method to make Firefox media calls succeed.
	# 		# Always fail the first time. Retry on failure.
	# 		#
	# 		if !!navigator.mozGetUserMedia and message.errorcode is 1001
	# 			callIntoConference_verto(extension, conferenceUsername, conferenceIdNumber, ((m) -> console.log("CALLBACK: "+JSON.stringify(m))), "webcam")
	# 		#
	# 		# End of hacky method
	# 		#
	# 	callIntoConference_verto(extension, conferenceUsername, conferenceIdNumber, debuggerCallback, "webcam");

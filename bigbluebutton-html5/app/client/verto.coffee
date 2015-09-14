Template.vertoDeskshare.events
	"click .vertoButton": (event) ->
		$("#settingsModal").foundation('reveal', 'close')

	"click #desksharePreview": (event) ->
		doDesksharePreview((->), (->), "webcam");

	"click #getAdjustedResolutions": (event) ->
		getAdjustedResolutions (result) ->
			for i of result
				$("#adjustedResolutions").append(i + ": " + result[i].width + "x" + result[i].height + "<br/>")

	"click .screenshareStart": (event) ->
		$("#screenshareStart").css('display', 'none')
		$("#screenshareStop").css('display', 'block')
		screenStart(true, (->), "webcam")

	"click .screenshareStop": (event) ->
		$("#screenshareStop").css('display', 'none')
		$("#screenshareStart").css('display', 'block')
		screenStart(false, (->))

	"click #webcamPreview": (event) ->
		doWebcamPreview((->), (->), "webcam");

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

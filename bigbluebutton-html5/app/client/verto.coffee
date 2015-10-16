Template.vertoDeskshareMenu.events
	"click .vertoButton": (event) ->
		$("#settingsModal").foundation('reveal', 'close')

	"click .screenshareShow": (event) ->
		$("#deskshareModal").foundation('reveal', 'open');

	"click .screenshareHide": (event) ->
		# if there is a local video feed then kill it
		if(!!window["deskshareStream"])
			$("#webcam").src = null;
			window["deskshareStream"].stop();
		else
			screenStart(false, (->))
			simulatePresenterDeskshareHasEnded();

	"click #installChromeExtension": (event) ->
		# do a check for Chrome desksharing extension
		successCallback = ->
			setInSession("gotChromeExtension", true)
			location.reload()

		failureCallback = (error) ->
			setInSession("gotChromeExtension", false)
			console.error error

		installExtension = ->
			# if it's Chrome start installing the extension
			!!navigator.webkitGetUserMedia && !!window.chrome && !!chrome.webstore && !!chrome.webstore.install &&
			chrome.webstore.install(
				"https://chrome.google.com/webstore/detail/#{Meteor.config.deskshareExtensionKey}",
				successCallback,
				failureCallback
			);
		installExtension()

Template.deskshareModal.events
	"click .screenshareStart": (event) ->
		$("#deskshareModal").foundation('reveal', 'close')
		screenStart(true, ((m)-> console.log(m)), "webcam")

	"click .screenshareStop": (event) ->
		$("#deskshareModal").foundation('reveal', 'close')
		screenStart(false, (->))

	"click #desksharePreview": (event) ->
		success = ->
			toggleWhiteboardVideo("video")
			setInSession("isPreviewingDeskshare", true)
		doDesksharePreview((-> success()), (->), "webcam");

	"click #stopDesksharePreview": (event) ->
		toggleWhiteboardVideo("whiteboard");
		setInSession("isPreviewingDeskshare", false);
		if(!!window["deskshareStream"])
			$("#webcam").src = null;
			window["deskshareStream"].stop();

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

# if remote deskshare has been ended disconnect and hide the video stream
@presenterDeskshareHasEnded = ->
	toggleWhiteboardVideo("whiteboard")
	exitVoiceCall()

# if remote deskshare has been started connect and display the video stream
@presenterDeskshareHasStarted = ->
	toggleWhiteboardVideo("video")
	joinVoiceCall @, {
		watchOnly: true
	}

# instead of a redis message notify the server to simulate a desksharing
# notification
@simulatePresenterDeskshareHasStarted = ->
	Meteor.call("simulatePresenterDeskshareHasStarted", getInSession("meetingId"), "12345", getInSession("userId"))

@simulatePresenterDeskshareHasEnded = ->
	Meteor.call("simulatePresenterDeskshareHasEnded", getInSession("meetingId"), getInSession("userId"))

Handlebars.registerHelper "canIPresentDeskshare", ->
	Meteor.Users.findOne({userId: getInSession("userId")})?.user.presenter and not Meteor.config.useSIPAudio

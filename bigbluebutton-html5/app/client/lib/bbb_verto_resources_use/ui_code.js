// Gather all resolutions for deskshare
// Create menu options for each one
this.makeDeskshareResolutions = function () {
	var videoConstraints = getAllPresetVideoResolutions();
	for(var i in videoConstraints) {
		v = videoConstraints[i];
		$("#deskshareResolutions").append("<option value='" + i + "'>" + v.name + " " + v.constraints.minWidth + "x" + v.constraints.minHeight + "</option>");
	}
}

this.makeWebcamResolutions = function () {
	var videoConstraints = getAllPresetVideoResolutions();
	for(var i in videoConstraints) {
		v = videoConstraints[i];
		$("#webcamResolutions").append("<input type='radio' name='webcamQuality' id='webcamQuality_" + i + "' value='" + i + "'>");
		$("#webcamResolutions").append("<label for='webcamQuality_" + i + "'>" + v.name + " " + v.constraints.minWidth + "x" + v.constraints.minHeight + "</label>");
	}
	$("#webcamQuality_qvga").prop("checked", true);
}

// retrieves the camera resolution the user selected
// displays a local feed of the user's webcam
doWebcamPreview = function(onSuccess, onFailure, videoTag) {
	var selectedVideoConstraints = getChosenWebcamResolution(); // this is the video profile the user chose
	selectedVideoConstraints = getWebcamConstraintsFromResolution(selectedVideoConstraints); // convert to a valid constraints object
	console.log("screen constraints", selectedVideoConstraints)
	previewLocalMedia(webcamStream, selectedVideoConstraints, videoTag, onSuccess, onFailure);
	window.videoTag = videoTag;
	my_real_size()
}

// return the webcam resolution that the user has selected
getChosenWebcamResolution = function() {
	var videoConstraints = getAllPresetVideoResolutions(); // retrieve all resolutions
	var selectedVideo = null;
	for(var i in videoConstraints) {
		selectedVideo = videoConstraints[i];
		if($("#webcamQuality_"+i).is(':checked')) { // compare against all resolutions
			break;
		}
	}
	return selectedVideo;
}

// receives a video resolution profile, and converts it into a constraints format for getUserMedia
getWebcamConstraintsFromResolution = function(resolution) {
	return {
		"audio": false,
		"video": {
			"mandatory": {
				"minWidth": resolution.constraints.minWidth,
				"maxWidth": resolution.constraints.maxWidth,
				"minHeight": resolution.constraints.minHeight,
				"maxHeight": resolution.constraints.maxHeight,
				"minFrameRate": resolution.constraints.minFrameRate
			},
			"optional": []
		}
	};
}

/*
	receives the handle to the global resource representing the video feed
	receives media constraints to request access to
	receives videoTag representing where the media (if any) should be rendered
	receives callbacks for success and failure
*/
previewLocalMedia = function(streamHandle, videoConstraints, videoTag, onSuccess, onFailure) {
	if(!!window[streamHandle]) {
		$("#" + videoTag).src = null;
		window[streamHandle].stop();
	}
	navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	navigator.getUserMedia(videoConstraints, function(stream) {
		window[streamHandle] = stream;
		$("#" + videoTag).get(0).src = URL.createObjectURL(stream);
		$("#" + videoTag).get(0).play();
		$("#" + videoTag).show();
		return onSuccess(stream);
	}, function(error) {
		return onFailure(error);
	});
}

doDesksharePreview = function(onSuccess, onFailure, videoTag, extensionId) {
	// Firefox
	if (!!navigator.mozGetUserMedia) {
		var selectedDeskshareResolution = getChosenDeskshareResolution(); // this is the video profile the user chose
		my_real_size(selectedDeskshareResolution);
		var selectedDeskshareConstraints = {
			video: {
				mediaSource: "window", // window, screen
				mozMediaSource: "window",
				mandatory: {
					maxWidth: 0,
					maxHeight: 0,
					frameRate : {min: 10, max: 10}
				}
			},
			audio: false
		};
		previewLocalMedia(deskshareStream, selectedDeskshareConstraints, videoTag, onSuccess, onFailure);
	} else if(!!window.chrome) {
		getChromeExtensionStatus(extensionId, function(status) {
			sourceId = null;
			getScreenConstraints(function(error, screen_constraints) {
				if(error) {
					return console.error(error);
				}

				console.log('screen_constraints', screen_constraints);
				var selectedDeskshareResolution = getChosenDeskshareResolution(); // this is the video profile the user chose
				my_real_size(selectedDeskshareResolution);
				var selectedDeskshareConstraints = getDeskshareConstraintsFromResolution(selectedDeskshareResolution, screen_constraints); // convert to a valid constraints object
				console.log(selectedDeskshareConstraints);
				previewLocalMedia(deskshareStream, selectedDeskshareConstraints, videoTag, onSuccess, onFailure);
			});
		});
	}
}

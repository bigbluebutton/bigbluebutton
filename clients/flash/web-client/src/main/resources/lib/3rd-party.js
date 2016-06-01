
var presenterUserID = "";

var registerListeners = function() {
  console.log("Listening for events.");
  BBB.listen("QueryPresentationsReplyEvent", function(bbbEvent) {   
    console.log("Number of presentations [" + bbbEvent.presentations.length + "]. First presentation [" + bbbEvent.presentations[0] + "].");
  });
  BBB.listen("OpenExternalFileUploadWindowEvent", function(bbbEvent) {
    console.log("Open file upload dialog. Max file size is [" + bbbEvent.maxFileSize + "].");
  });
  BBB.listen("UserKickedOutEvent", function(bbbEvent) {
    console.log("User has been kicked [" + bbbEvent.userID + "].");
  });
  BBB.listen("SwitchedLayoutEvent", function(bbbEvent) {
    console.log("New Layout [" + bbbEvent.layoutID + "].");
  });
  BBB.listen("NewRoleEvent", function(bbbEvent) {
    console.log("New Role Event [amIPresenter=" + bbbEvent.amIPresenter + ",role=" + bbbEvent.role + ",newPresenterUserID=" + bbbEvent.newPresenterUserID + "].");
  });
  BBB.listen("SwitchedPresenterEvent", function(bbbEvent) {
    console.log("Switched Presenter [amIPresenter=" + bbbEvent.amIPresenter + ",role=" + bbbEvent.role + ",newPresenterUserID=" + bbbEvent.newPresenterUserID + "].");
	
	presenterUserID = bbbEvent.newPresenterUserID;
	
	if (bbbEvent.amIPresenter) {
		console.log("*** I am presenter. Am I publishing webcam?");
		BBB.listen("AmISharingCamQueryResponse", function(bbbEvent2) {
			console.log("AmISharingCamQueryResponse [isPublishing=" + bbbEvent2.isPublishing + ",camIndex=" + bbbEvent2.camIndex + "]");
		});
		BBB.amISharingWebcam();
		BBB.amISharingWebcam(function(bbbEvent3) {
			console.log("amISharingWebcam [isPublishing=" + bbbEvent3.isPublishing 
						+ ",camIndex=" + bbbEvent3.camIndex 
						+ ",camWidth=" + bbbEvent3.camWidth
						+ ",camHeight=" + bbbEvent3.camHeight
						+ ",camKeyFrameInterval=" + bbbEvent3.camKeyFrameInterval
						+ ",camModeFps=" + bbbEvent3.camModeFps
						+ ",camQualityBandwidth=" + bbbEvent3.camQualityBandwidth
						+ ",camQualityPicture=" + bbbEvent3.camQualityPicture						
						+ "]");
			if (bbbEvent3.isPublishing) {	
				CAM_PREVIEW.stopPreviewCamera(bbbEvent3.avatarURL);
				CAM_PREVIEW.previewCamera(bbbEvent3.camIndex, bbbEvent3.camWidth, bbbEvent3.camHeight, bbbEvent3.camKeyFrameInterval,
										  bbbEvent3.camModeFps, bbbEvent3.camQualityBandwidth, bbbEvent3.camQualityPicture, bbbEvent3.avatarURL);
			}
		});
	} else {
		console.log("*** I am NOT presenter. Is new presenter publishing webcam?");
		BBB.listen("IsUserPublishingCamResponse", function(bbbEvent4) {
			console.log("IsUserPublishingCamResponse [isUserPublishing=" + bbbEvent4.isUserPublishing 
						+ ",uri=" + bbbEvent4.uri 
						+ ",streamName=" + bbbEvent4.streamName + "]");
		});
		BBB.isUserSharingWebcam(bbbEvent.newPresenterUserID);
		BBB.isUserSharingWebcam(bbbEvent.newPresenterUserID, function(bbbEvent5) {
			console.log("isUserSharingWebcam [isUserPublishing=" + bbbEvent5.isUserPublishing 
						+ ",uri=" + bbbEvent5.uri 
						+ ",streamName=" + bbbEvent5.streamName + "]");
			if (presenterUserID == bbbEvent.userID) {
				CAM_VIEW.stopViewWebcamStream(bbbEvent.avatarURL);
				CAM_VIEW.viewWebcamStream(bbbEvent.uri, bbbEvent.streamName, bbbEvent5.avatarURL);
			}
		});	
		CAM_PREVIEW.stopPreviewCamera(bbbEvent.avatarURL);
	}
  });
  BBB.listen("UserLeftEvent", function(bbbEvent) {
    console.log("User [" + bbbEvent.userID + "] has left.");
  });
  BBB.listen("UserJoinedEvent", function(bbbEvent) {
    console.log("User [" + bbbEvent.userID + ", [" + bbbEvent.userName + "] has joined.");
  });
  BBB.listen("NewPublicChatEvent", function(bbbEvent) {
    console.log("Received NewPublicChatEvent [" + bbbEvent.message + "]");
  });
  BBB.listen("NewPrivateChatEvent", function(bbbEvent) {
    console.log("Received NewPrivateChatEvent event");
  });
  BBB.listen("UserJoinedVoiceEvent", function(bbbEvent) {
    console.log("User [" + bbbEvent.userID + "] had joined the voice conference.");
  });
  BBB.listen("UserLeftVoiceEvent", function(bbbEvent) {
    console.log("User [" + bbbEvent.userID + "has left the voice conference.");
  });
  BBB.listen("UserVoiceMutedEvent", function(bbbEvent) {
    console.log("User [" + bbbEvent.userID + "] is muted [" + bbbEvent.muted + "]");
  });
  BBB.listen("UserLockedVoiceEvent", function(bbbEvent) {
    console.log("User [" + bbbEvent.userID + "] is locked [" + bbbEvent.locked + "]");
  });
  BBB.listen("CamStreamSharedEvent", function(bbbEvent) {
    console.log("User CamStreamSharedEvent [" + bbbEvent.uri + "," + bbbEvent.streamName + "]");
	if (presenterUserID == bbbEvent.userID) {
	    CAM_VIEW.stopViewWebcamStream(bbbEvent.avatarURL);
		  CAM_VIEW.viewWebcamStream(bbbEvent.uri, bbbEvent.streamName, bbbEvent.avatarURL);
	}
  });
  BBB.listen("BroadcastingCameraStartedEvent", function(bbbEvent) {
    console.log("User BroadcastingCameraStartedEvent [" + bbbEvent.camIndex + "] [" + bbbEvent.camWidth + "]");
	if (bbbEvent.isPresenter) {	
		CAM_PREVIEW.stopPreviewCamera(bbbEvent.avatarURL);
		CAM_PREVIEW.previewCamera(bbbEvent.camIndex, bbbEvent.camWidth, bbbEvent.camHeight, bbbEvent.camKeyFrameInterval,
								  bbbEvent.camModeFps, bbbEvent.camQualityBandwidth, bbbEvent.camQualityPicture, bbbEvent.avatarURL);
	}
  });
  BBB.listen("BroadcastingCameraStoppedEvent", function(bbbEvent) {
    console.log("User BroadcastingCameraStoppedEvent ]");
    CAM_PREVIEW.stopPreviewCamera(bbbEvent.avatarURL);
  });

  console.log("Listen Presentation Updates");
  BBB.listen("OfficeDocConversionSuccessEvent", function(bbbEvent) {
    console.log("Successfully converted Office document. : " + JSON.stringify(bbbEvent));
  });

  BBB.listen("OfficeDocConversionFailedEvent", function(bbbEvent) {
    console.log("Failed to convert Office document. : " + JSON.stringify(bbbEvent));
  });

  BBB.listen("SupportedDocEvent", function(bbbEvent) {
    console.log("Uploaded presentation file type is supported. : " + JSON.stringify(bbbEvent));
  });

  BBB.listen("UnsupportedDocEvent", function(bbbEvent) {
    console.log("Uploaded presentation file type is unsupported. : " + JSON.stringify(bbbEvent));
  });

  BBB.listen("PageCountFailedEvent", function(bbbEvent) {
    console.log("Failed to determine number of pages for the uploaded presentation. : " + JSON.stringify(bbbEvent));
  });

  BBB.listen("ThumbnailsUpdateEvent", function(bbbEvent) {
    console.log("Generating thumbnails for uploaded presentation. : " + JSON.stringify(bbbEvent));
  });

  BBB.listen("PageCountExceededEvent", function(bbbEvent) {
    console.log("Uploaded presentation had exceeded max number of pages. : " + JSON.stringify(bbbEvent));
  });

  BBB.listen("ConversionSuccessEvent", function(bbbEvent) {
    console.log("Successfully converted uploaded presentation. : " + JSON.stringify(bbbEvent));
  });

  BBB.listen("ConversionProgressEvent", function(bbbEvent) {
    console.log("Progress update on conversion process. : " + JSON.stringify(bbbEvent));
  });
  
}

var leaveVoiceConference2 = function () {
  BBB.leaveVoiceConference();
}

var joinVoiceConference2 = function () {
  BBB.joinVoiceConference();
}

var amIPresenterAsync = function() {
  BBB.listen("AmIPresenterQueryResponse", function(bbbEvent) {
    console.log("Received AmIPresenterQueryResponse event [" + bbbEvent.amIPresenter + "]");
  });

  BBB.amIPresenter();
}

var amIPresenterSync = function() {
  BBB.amIPresenter(function(amIPresenter) {
    console.log("Am I Presenter = " + amIPresenter);
  });
}

var getMyUserInfoAsynch = function() {
  BBB.listen("GetMyUserInfoResponse", function(bbbEvent) {
    console.log("User info response [myUserID=" + bbbEvent.myUserID
                                + ",myUsername=" + bbbEvent.myUsername + ",myAvatarURL=" + bbbEvent.myAvatarURL
                                + ",myRole=" + bbbEvent.myRole + ",amIPresenter=" + bbbEvent.amIPresenter
                                + ",dialNumber=" + bbbEvent.dialNumber + ",voiceBridge=" + bbbEvent.voiceBridge + "].");

    for(var key in bbbEvent.customdata){
      console.log(key + " " + bbbEvent.customdata[key]);
    }
  });

  BBB.getMyUserInfo();
}

var getMyUserInfoSynch = function() {
  BBB.getMyUserInfo(function(userInfo) {
    console.log("User info callback [myUserID=" + userInfo.myUserID
                                + ",myUsername=" + userInfo.myUsername + ",myAvatarURL=" + userInfo.myAvatarURL
                                + ",myRole=" + userInfo.myRole + ",amIPresenter=" + userInfo.amIPresenter
                                + ",dialNumber=" + userInfo.dialNumber + ",voiceBridge=" + userInfo.voiceBridge + "].");

    for(var key in userInfo.customdata){
      console.log(key + " " + userInfo.customdata[key]);
    }
  });
}


var getMyRoleAsynch = function() {
  BBB.listen("GetMyRoleResponse", function(bbbEvent) {
    console.log("Received GetMyRoleResponse event [" + bbbEvent.myRole + "]");
  });

  BBB.getMyRole();
}

var getMyRoleSynch = function() {
  BBB.getMyRole(function(myRole) {
    console.log("My role = " + myRole);
  });
}

var getMyUserID = function() {
  BBB.getMyUserID(function(userID) {
    console.log("My user ID  = [" + userID + "]");
  });
}

var getMeetingID = function() {
  BBB.getMeetingID(function(meetingID) {
    console.log("Meeting ID  = [" + meetingID + "]");
  });
}

var emojiStatus = function(emojiStatus) {
  BBB.emojiStatus(emojiStatus);
}

var muteMe = function() {
  BBB.muteMe();
}

var unmuteMe = function() {
  BBB.unmuteMe();
}

var muteAll = function() {
  BBB.muteAll();
}

var unmuteAll = function() {
  BBB.unmuteAll();
} 

var switchLayout = function(newLayout) {
  BBB.switchLayout(newLayout);
}

var lockLayout = function(lock) {
  BBB.lockLayout(lock);
}

var queryListOfPresentations = function() {
  BBB.queryListOfPresentations();
}

var displayPresentation = function(presentationID) {
  BBB.displayPresentation(presentationID);
}

var deletePresentation = function(presentationID) {
  BBB.deletePresentation(presentationID);
}

var sendPublicChat = function () {
  var message = "Hello from the Javascript API";
  BBB.sendPublicChatMessage('0x7A7A7A', "en", message);
}

var sendPrivateChat = function () {
  var message = "ECHO: " + bbbEvent.message;
  BBB.sendPrivateChatMessage(bbbEvent.fromColor, bbbEvent.fromLang, message,  bbbEvent.fromUserID);
}

var webcamViewStandaloneAppReady = function() {
  console.log("WebcamViewStandalone App is ready.");
  BBB.getPresenterUserID(function(puid) {
	if (puid == "") {
	  console.log("There is no presenter in the meeting");
	} else {
	  console.log("The presenter user id is [" + puid + "]");
	  // Is presenter sharing webcam? If so, get the webcam stream and display.
	}
  });
}

var webcamPreviewStandaloneAppReady = function() {
  console.log("WebcamPreviewStandalone App is ready.");
  BBB.getPresenterUserID(function(puid) {
	if (puid == "") {
	  console.log("There is no presenter in the meeting");
	} else {
	  console.log("The presenter user id is [" + puid + "]");
	}
  });
  // Am I presenter? If so, am I publishing my camera? If so, display my camera.
  
}

var uploadPresentation = function() {

  console.log("uploadPresentation");
  
  BBB.getInternalMeetingID(function(meetingID) {
    var formData = new FormData($('form')[0]);
    formData.append("presentation_name", document.getElementById('fileUpload').value.split(/(\\|\/)/g).pop());
    formData.append("conference", meetingID);
    formData.append("room", meetingID);
    
    $.ajax({
        url: '/bigbluebutton/presentation/upload',  //server script to process data
        type: 'POST',
        xhr: function() {  // custom xhr
            myXhr = $.ajaxSettings.xhr();
            if(myXhr.upload){ // check if upload property exists
                myXhr.upload.addEventListener('progress',progressHandlingFunction, false); // for handling the progress of the upload
            }
            return myXhr;
        },
        //Ajax events
        success: completeHandler,
        error: errorHandler,
        // Form data
        data: formData,
        //Options to tell JQuery not to process data or worry about content-type
        cache: false,
        contentType: false,
        processData: false
    });
  });
}

function progressHandlingFunction(e){
    if(e.lengthComputable){
        console.log("progress: loaded " + e.loaded + " total:" + e.total);
    }
}
function completeHandler(e){
  $('form')[0].reset();
  console.log("you file has been uploaded!");
}
function errorHandler(e){
  console.log("There was an error uploading your file.");
}

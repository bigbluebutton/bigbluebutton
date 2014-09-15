
var callerIdName, conferenceVoiceBridge, userAgent, userMicMedia, userWebcamMedia, currentSession;

function callIntoConference(voiceBridge, callback) {
	if (!callerIdName) {
		BBB.getMyUserInfo(function(userInfo) {
			console.log("User info callback [myUserID=" + userInfo.myUserID
				+ ",myUsername=" + userInfo.myUsername + ",myAvatarURL=" + userInfo.myAvatarURL
				+ ",myRole=" + userInfo.myRole + ",amIPresenter=" + userInfo.amIPresenter
				+ ",dialNumber=" + userInfo.dialNumber + ",voiceBridge=" + userInfo.voiceBridge + "].");
			
			callerIdName = userInfo.myUserID + "-bbbID-" + userInfo.myUsername;
			conferenceVoiceBridge = userInfo.voiceBridge
			voiceBridge = voiceBridge || conferenceVoiceBridge;
			
			console.log(callerIdName);
			webrtc_call(callerIdName, voiceBridge, callback);
		});
	} else {
		voiceBridge = voiceBridge || conferenceVoiceBridge;
		webrtc_call(callerIdName, voiceBridge, callback);
	}
}

function joinWebRTCVoiceConference() {
	console.log("Joining to the voice conference");
	var callback = function(message) {
		switch (message.status) {
			case 'failed':
				BBB.webRTCConferenceCallFailed(message.cause);
				break;
			case 'ended':
				BBB.webRTCConferenceCallEnded();
				break;
			case 'started':
				BBB.webRTCConferenceCallStarted();
				break;
			case 'connecting':
				BBB.webRTCConferenceCallConnecting();
				break;
			case 'mediarequest':
				BBB.webRTCMediaRequest();
				break;
			case 'mediasuccess':
				BBB.webRTCMediaSuccess();
				break;
			case 'mediafail':
				BBB.webRTCMediaFail();
				break;
		}
	}
	
	callIntoConference(conferenceVoiceBridge, callback);
}

function leaveWebRTCVoiceConference() {
	console.log("Leaving the voice conference");
	
	webrtc_hangup();
}

function startWebRTCAudioTest(){
	console.log("Testing webrtc audio");
	var callback = function(message) {
		switch(message.status) {
			case 'failed':
				BBB.webRTCEchoTestFailed(message.cause);
				break;
			case 'ended':
				BBB.webRTCEchoTestEnded();
				break;
			case 'started':
				BBB.webRTCEchoTestStarted();
				break;
			case 'connecting':
				BBB.webRTCEchoTestConnecting();
				break;
			case 'mediarequest':
				BBB.webRTCMediaRequest();
				break;
			case 'mediasuccess':
				BBB.webRTCMediaSuccess();
				break;
			case 'mediafail':
				BBB.webRTCMediaFail();
				break;
		}
	}
	
	callIntoConference("9196", callback);
}

function stopWebRTCAudioTest(){
	console.log("Stopping webrtc audio test");
	
	webrtc_hangup();
}

function stopWebRTCAudioTestJoinConference(){
	console.log("Stopping webrtc audio test and joining conference afterwards");
	var callback = function(request) {
		joinWebRTCVoiceConference();
	}
	
	webrtc_hangup(callback);
}

function requestWebRTCWebcam(){
	var callback = function(message) {
		switch(message.status) {
			case 'mediarequest':
				BBB.webRTCWebcamRequest();
				break;
			case 'mediasuccess':
				BBB.webRTCWebcamRequestSuccess();
				break;
			case 'mediafail':
				BBB.webRTCWebcamRequestFail(message.cause);
				break;
		}
	}
	
	makeWebRTCWebcamRequest(callback);
}

function makeWebRTCWebcamRequest(callback)
{
	console.log("Requesting webcam permissions on Chrome ");
	
	callback({'status':'mediarequest'});
	
	getUserWebcamMedia(function(stream) {
			console.log("getUserWebcamMedia: success");
			userWebcamMedia = stream;
			callback({'status':'mediasuccess'});
		}, function(error) {
		    console.error("getUserWebcamMedia: failure - " + error.name);
			callback({'status':'mediafail', 'cause': error.name});
		}
	);	
}

function createUA(username, server, callback) {
	if (userAgent) {
		console.log("User agent already created");
		return;
	}
	
	console.log("Creating new user agent");
	
	/* VERY IMPORTANT 
	 *	- You must escape the username because spaces will cause the connection to fail
	 *	- We are connecting to the websocket through an nginx redirect instead of directly to 5066
	 */
	var configuration = {
		uri: 'sip:' + encodeURIComponent(username) + '@' + server,
		wsServers: 'ws://' + server + '/ws',
		displayName: username,
		register: false,
		traceSip: false,
		userAgentString: "BigBlueButton",
		stunServers: "stun:stun.freeswitch.org"
	};
	
	userAgent = new SIP.UA(configuration);
	userAgent.on('disconnected', function() {
		if (userAgent) {
			userAgent.stop();
			userAgent = null;
			callback({'status':'failed', 'cause': 'Could not make a WebSocket Connection'});
		}
	});
	
	userAgent.start();
};

function getUserWebcamMedia(getUserWebcamMediaSuccess, getUserWebcamMediaFailure) {
	if (userWebcamMedia == undefined) {
		if (SIP.WebRTC.isSupported()) {
			SIP.WebRTC.getUserMedia({audio:false, video:true}, getUserWebcamMediaSuccess, getUserWebcamMediaFailure);
		} else {
			console.log("getUserWebcamMedia: webrtc not supported");
			getUserWebcamMediaFailure("WebRTC is not supported");
		}
	} else {
		console.log("getUserWebcamMedia: webcam already set");
		getUserWebcamMediaSuccess(userWebcamMedia);
	}
};

function getUserMicMedia(getUserMicMediaSuccess, getUserMicMediaFailure) {
	if (userMicMedia == undefined) {
		if (SIP.WebRTC.isSupported()) {
			SIP.WebRTC.getUserMedia({audio:true, video:false}, getUserMicMediaSuccess, getUserMicMediaFailure);
		} else {
			console.log("getUserMicMedia: webrtc not supported");
			getUserMicMediaFailure("WebRTC is not supported");
		}
	} else {
		console.log("getUserMicMedia: mic already set");
		getUserMicMediaSuccess(userMicMedia);
	}
};

function webrtc_call(username, voiceBridge, callback) {
	if (!isWebRTCAvailable()) {
		callback({'status': 'browserError', message: "Browser version not supported"});
		return;
	}
	
	var server = window.document.location.host;
	console.log("user " + username + " calling to " +  voiceBridge);
	
	if (!userAgent) {
		createUA(username, server, callback);
	}
	
	if (userMicMedia !== undefined) {
		make_call(username, voiceBridge, server, callback);
	} else {
		callback({'status':'mediarequest'});
		getUserMicMedia(function(stream) {
				console.log("getUserMicMedia: success");
				userMicMedia = stream;
				callback({'status':'mediasuccess'});
				make_call(username, voiceBridge, server, callback);
			}, function(e) {
				console.error("getUserMicMedia: failure - " + e);
				callback({'status':'mediafail', 'cause': e});
			}
		);
	}
}

function make_call(username, voiceBridge, server, callback) {
	// Make an audio/video call:
	console.log("Setting options.. ");
	var options = {
		media: {
			stream: userMicMedia,
			render: {
				remote: {
					audio: document.getElementById('remote-media')
				}
			}
		}
	};
	
	console.log("Calling to " + voiceBridge + "....");
	currentSession = userAgent.invite('sip:' + voiceBridge + '@' + server, options); 
	
	console.log('call connecting');
	callback({'status':'connecting'});
	// The connecting event fires before the listener can be added
	currentSession.on('connecting', function(){
		//console.log('call connecting');
		//callback({'status':'connecting'});
	});
	currentSession.on('failed', function(response, cause){
		console.log('call failed with cause: '+ cause);
		callback({'status':'failed', 'cause': cause});
	});
	currentSession.on('bye', function(request){
		console.log('call ended ' + currentSession.endTime);
		callback({'status':'ended'});
	});
	currentSession.on('accepted', function(data){
		console.log('BigBlueButton call started');
		callback({'status':'started'});
	});
}

function webrtc_hangup(callback) {
	console.log("Hanging up current session");
	if (callback) {
	  currentSession.on('bye', callback);
	}
	currentSession.bye();
}

function isWebRTCAvailable() {
	return SIP.WebRTC.isSupported();
}


var callerIdName, conferenceVoiceBridge, userAgent, userMedia, currentSession;

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
			case 'mediafailed':
				BBB.webRTCMediaFail();
				break;
		}
	}
	
	callIntoConference(conferenceVoiceBridge, callback);
}

function leaveWebRTCVoiceConference() {
	console.log("Leaving the voice conference");
	var callback = function(request) {
		BBB.leaveWebRTCVoiceConferenceCallback();
	}
	
	webrtc_hangup(callback);
}

function startWebrtcAudioTest(){
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
			case 'mediafailed':
				BBB.webRTCMediaFail();
				break;
		}
	}
	
	callIntoConference("9196", callback);
}

function stopWebrtcAudioTest(){
	console.log("Stopping webrtc audio test");
	var callback = function(request) {
		BBB.leaveWebRTCVoiceConferenceCallback();
	}
	
	webrtc_hangup(callback);
}

function createUA(username, server) {
	if (userAgent) {
		console.log("User agent already created");
		return;
	}
	
	console.log("Creating new user agent");
	
	var configuration = {
		uri: 'sip:' + username + '@' + server,
		ws_servers: 'ws://' + server + ':5066',
		display_name: username,
		register: false,
		trace_sip: false,
		stun_servers: "stun:74.125.134.127:19302",
	};
	
	userAgent = new SIP.UA(configuration);
	
	userAgent.start();
};

function getMic(getUserMediaSuccess, getUserMediaFailure) {
	if (!userMedia) {
		if (SIP.WebRTC.isSupported()) {
			SIP.WebRTC.getUserMedia({audio:true, video:false}, getUserMediaSuccess, getUserMediaFailure);
		} else {
			console.log("getMic: webrtc not supported");
			getUserMediaFailure("WebRTC is not supported");
		}
	} else {
		console.log("getMic: media already set");
		getUserMediaSuccess(userMedia);
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
		createUA(username, server);
	}
	
	if (userMedia) {
		make_call(username, voiceBridge, server, callback);
	} else {
		callback({'status':'mediarequest'});
		getMic(function(stream) {
				console.log("getUserMedia: success");
				userMedia = stream;
				callback({'status':'mediasuccess'});
				make_call(username, voiceBridge, server, callback);
			}, function(e) {
				console.error("getUserMedia: failure - " + e);
				callback({'status':'mediafailed', 'cause': e});
			}
		);
	}
}

function make_call(username, voiceBridge, server, callback) {
	// Make an audio/video call:
	console.log("Setting options.. ");
	var options = {
		stream: userMedia,
    	render: {
			remote: {
				audio: document.getElementById('remote-media')
			}
		}
	};
	
	console.log("Calling to " + voiceBridge + "....");
	currentSession = userAgent.invite('sip:' + voiceBridge + '@' + server, options); 
	
	currentSession.on('failed', function(response, cause){
		console.log('call failed with cause: '+ cause);
		callback({'status':'failed', 'cause': cause});
	});
	currentSession.on('bye', function(request){
		console.log('call ended ' + newSession.endTime);
		callback({'status':'ended'});
	});
	currentSession.on('accepted', function(data){
		console.log('BigBlueButton call started');
		callback({'status':'started'});
	});
	currentSession.on('connecting', function(){
		console.log('call connecting');
		callback({'status':'connecting'});
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

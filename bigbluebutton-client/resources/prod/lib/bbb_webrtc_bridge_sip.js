
var userID, callerIdName, conferenceVoiceBridge, userAgent, userMicMedia, userWebcamMedia, currentSession, callTimeout, callActive, callICEConnected, callFailCounter, callPurposefullyEnded, uaConnected, transferTimeout;
var inEchoTest = true;

function webRTCCallback(message) {
	switch (message.status) {
		case 'failed':
			if (message.errorcode !== 1004) {
				message.cause = null;
			}
			BBB.webRTCCallFailed(inEchoTest, message.errorcode, message.cause);
			break;
		case 'ended':
			BBB.webRTCCallEnded(inEchoTest);
			break;
		case 'started':
			BBB.webRTCCallStarted(inEchoTest);
			break;
		case 'connecting':
			BBB.webRTCCallConnecting(inEchoTest);
			break;
		case 'waitingforice':
			BBB.webRTCCallWaitingForICE(inEchoTest);
			break;
		case 'transferring':
			BBB.webRTCCallTransferring(inEchoTest);
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

function callIntoConference(voiceBridge, callback) {
	if (!callerIdName) {
		BBB.getMyUserInfo(function(userInfo) {
			console.log("User info callback [myUserID=" + userInfo.myUserID
				+ ",myUsername=" + userInfo.myUsername + ",myAvatarURL=" + userInfo.myAvatarURL
				+ ",myRole=" + userInfo.myRole + ",amIPresenter=" + userInfo.amIPresenter
				+ ",dialNumber=" + userInfo.dialNumber + ",voiceBridge=" + userInfo.voiceBridge + "].");
			userID = userInfo.myUserID;
			callerIdName = userInfo.myUserID + "-bbbID-" + userInfo.myUsername;
			conferenceVoiceBridge = userInfo.voiceBridge
			if (voiceBridge === "9196") {
				voiceBridge = voiceBridge + conferenceVoiceBridge;
			} else {
				voiceBridge = conferenceVoiceBridge;
			}
			console.log(callerIdName);
			webrtc_call(callerIdName, voiceBridge, callback);
		});
	} else {
		if (voiceBridge === "9196") {
			voiceBridge = voiceBridge + conferenceVoiceBridge;
		} else {
			voiceBridge = conferenceVoiceBridge;
		}
		webrtc_call(callerIdName, voiceBridge, callback);
	}
}

function joinWebRTCVoiceConference() {
	console.log("Joining to the voice conference directly");
	inEchoTest = false;
	callIntoConference(conferenceVoiceBridge, webRTCCallback);
}

function leaveWebRTCVoiceConference() {
	console.log("Leaving the voice conference");
	
	webrtc_hangup();
}

function startWebRTCAudioTest(){
	console.log("Joining the audio test first");
	inEchoTest = true;
	callIntoConference("9196", webRTCCallback);
}

function stopWebRTCAudioTest(){
	console.log("Stopping webrtc audio test");
	
	webrtc_hangup();
}

function stopWebRTCAudioTestJoinConference(){
	console.log("Transferring from audio test to conference");
	
	webRTCCallback({'status': 'transferring'});
	
	transferTimeout = setTimeout( function() {
		console.log("Call transfer failed. No response after 3 seconds");
		webRTCCallback({'status': 'failed', 'errorcode': 1008});
		currentSession = null;
		var userAgentTemp = userAgent;
		userAgent = null;
		userAgentTemp.stop();
	}, 3000);
	
	BBB.listen("UserJoinedVoiceEvent", userJoinedVoiceHandler);
	
	currentSession.dtmf(1);
	inEchoTest = false;
}

function userJoinedVoiceHandler(event) {
	console.log("UserJoinedVoiceHandler - " + event);
	if (inEchoTest === false && userID === event.userID) {
		BBB.unlisten("UserJoinedVoiceEvent", userJoinedVoiceHandler);
		clearTimeout(transferTimeout);
		webRTCCallback({'status': 'started'});
	}
}

function createUA(username, server, callback) {
	if (userAgent) {
		console.log("User agent already created");
		return;
	}

	console.log("Fetching STUN/TURN server info for user agent");

	$.ajax({
		dataType: 'json',
		url: '/bigbluebutton/api/stuns'
	}).done(function(data) {
		var stunsConfig = {};
		stunsConfig['stunServers'] = data['stunServers'].map(function(data) {
			return data['url'];
		});
		stunsConfig['turnServers'] = data['turnServers'].map(function(data) {
			return {
				'urls': data['url'],
				'username': data['username'],
				'password': data['password']
			};
		});
		createUAWithStuns(username, server, callback, stunsConfig);
	}).fail(function(data, textStatus, errorThrown) {
		console.log("Could not fetch stun/turn servers: " + textStatus);
		callback({'status':'failed', 'errorcode': 1009});
	});
}

function createUAWithStuns(username, server, callback, stunsConfig) {
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
		traceSip: true,
		autostart: false,
		userAgentString: "BigBlueButton",
		stunServers: stunsConfig['stunServers'],
		turnServers: stunsConfig['turnServers']
	};
	
	uaConnected = false;
	
	userAgent = new SIP.UA(configuration);
	userAgent.on('connected', function() {
		uaConnected = true;
	});
	userAgent.on('disconnected', function() {
		if (userAgent) {
			userAgent.stop();
			userAgent = null;
			
			if (uaConnected) {
				callback({'status':'failed', 'errorcode': 1001}); // WebSocket disconnected
			} else {
				callback({'status':'failed', 'errorcode': 1002}); // Could not make a WebSocket connection
			}
		}
	});
	
	userAgent.start();
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
		callback({'status': 'failed', 'errorcode': 1003}); // Browser version not supported
		return;
	}
	
	var server = window.document.location.hostname;
	console.log("user " + username + " calling to " +  voiceBridge);
	
	if (!userAgent) {
		createUA(username, server, callback);
	}
	
	if (userMicMedia !== undefined) {
		make_call(username, voiceBridge, server, callback, false);
	} else {
		callback({'status':'mediarequest'});
		getUserMicMedia(function(stream) {
				console.log("getUserMicMedia: success");
				userMicMedia = stream;
				callback({'status':'mediasuccess'});
				make_call(username, voiceBridge, server, callback, false);
			}, function(e) {
				console.error("getUserMicMedia: failure - " + e);
				callback({'status':'mediafail', 'cause': e});
			}
		);
	}
}

function make_call(username, voiceBridge, server, callback, recall) {
	if (userAgent == null) {
		console.log("userAgent is still null. Delaying call");
		var callDelayTimeout = setTimeout( function() {
			make_call(username, voiceBridge, server, callback, recall);
		}, 100);
	}

	if (!userAgent.isConnected()) {
		console.log("Trying to make call, but UserAgent hasn't connected yet. Delaying call");
		userAgent.once('connected', function() {
			console.log("UserAgent has now connected, retrying the call");
			make_call(username, voiceBridge, server, callback, recall);
		});
		return;
	}

	if (currentSession) {
		console.log('Active call detected ignoring second make_call');
		return;
	}

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
	
	callTimeout = setTimeout(function() {
		console.log('Ten seconds without updates sending timeout code');
		callback({'status':'failed', 'errorcode': 1006}); // Failure on call
		currentSession = null;
		var userAgentTemp = userAgent;
		userAgent = null;
		userAgentTemp.stop();
	}, 10000);
	
	callActive = false;
	callICEConnected = false;
	callPurposefullyEnded = false;
	callFailCounter = 0;
	console.log("Calling to " + voiceBridge + "....");
	currentSession = userAgent.invite('sip:' + voiceBridge + '@' + server, options); 
	
	// Only send the callback if it's the first try
	if (recall === false) {
		console.log('call connecting');
		callback({'status':'connecting'});
	} else {
		console.log('call connecting again');
	}
	
	// The connecting event fires before the listener can be added
	currentSession.on('connecting', function(){
		clearTimeout(callTimeout);
	});
	currentSession.on('progress', function(response){
		console.log('call progress: ' + response);
		clearTimeout(callTimeout);
	});
	currentSession.on('failed', function(response, cause){
		console.log('call failed with cause: '+ cause);
		
		if (currentSession) {
			if (callActive === false) {
				callback({'status':'failed', 'errorcode': 1004, 'cause': cause}); // Failure on call
				currentSession = null;
				var userAgentTemp = userAgent;
				userAgent = null;
				userAgentTemp.stop();
			} else {
				callActive = false;
				//currentSession.bye();
				currentSession = null;
				userAgent.stop();
			}
		}
		clearTimeout(callTimeout);
	});
	currentSession.on('bye', function(request){
		callActive = false;
		
		if (currentSession) {
			console.log('call ended ' + currentSession.endTime);
			
			if (callPurposefullyEnded === true) {
				callback({'status':'ended'});
			} else {
				callback({'status':'failed', 'errorcode': 1005}); // Call ended unexpectedly
			}
			clearTimeout(callTimeout);
			currentSession = null;
		} else {
			console.log('bye event already received');
		}
	});
	currentSession.on('accepted', function(data){
		callActive = true;
		console.log('BigBlueButton call accepted');
		
		if (callICEConnected === true) {
			callback({'status':'started'});
		} else {
			callback({'status':'waitingforice'});
		}
		clearTimeout(callTimeout);
	});
	currentSession.mediaHandler.on('iceFailed', function() {
		console.log('received ice negotiation failed');
		callback({'status':'failed', 'errorcode': 1007}); // Failure on call
		currentSession = null;
		var userAgentTemp = userAgent;
		userAgent = null;
		userAgentTemp.stop();
		
		clearTimeout(callTimeout);
	});
	
	// Some browsers use status of 'connected', others use 'completed', and a couple use both
	
	currentSession.mediaHandler.on('iceConnected', function() {
		console.log('Received ICE status changed to connected');
		if (callICEConnected === false) {
			callICEConnected = true;
			if (callActive === true) {
				callback({'status':'started'});
			}
			clearTimeout(callTimeout);
		}
	});
	
	currentSession.mediaHandler.on('iceCompleted', function() {
		console.log('Received ICE status changed to completed');
		if (callICEConnected === false) {
			callICEConnected = true;
			if (callActive === true) {
				callback({'status':'started'});
			}
			clearTimeout(callTimeout);
		}
	});
}

function webrtc_hangup(callback) {
	callPurposefullyEnded = true;

	console.log("Hanging up current session");
	if (callback) {
	  currentSession.on('bye', callback);
	}
	currentSession.bye();
}

function isWebRTCAvailable() {
	return SIP.WebRTC.isSupported();
}

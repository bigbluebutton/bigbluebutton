
var userID, callerIdName=null, conferenceVoiceBridge, userAgent=null, userMicMedia, userWebcamMedia, currentSession=null, callTimeout, callActive, callICEConnected, iceConnectedTimeout, callFailCounter, callPurposefullyEnded, uaConnected, transferTimeout, iceGatheringTimeout;
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

function callIntoConference(voiceBridge, callback, isListenOnly) {
	// root of the call initiation process from the html5 client
	// Flash will not pass in the listen only field. For html5 it is optional. Assume NOT listen only if no state passed
	if (isListenOnly == null) {
		isListenOnly = false;
	}
	// reset callerIdName
	callerIdName = null;
	if (!callerIdName) {
		BBB.getMyUserInfo(function(userInfo) {
			console.log("User info callback [myUserID=" + userInfo.myUserID
				+ ",myUsername=" + userInfo.myUsername + ",myAvatarURL=" + userInfo.myAvatarURL
				+ ",myRole=" + userInfo.myRole + ",amIPresenter=" + userInfo.amIPresenter
				+ ",dialNumber=" + userInfo.dialNumber + ",voiceBridge=" + userInfo.voiceBridge
				+ ",isListenOnly=" + isListenOnly + "].");
			userID = userInfo.myUserID;
			callerIdName = userInfo.myUserID + "-bbbID-" + userInfo.myUsername;
			if (isListenOnly) {
				//prepend the callerIdName so it is recognized as a global audio user
				callerIdName = "GLOBAL_AUDIO_" + callerIdName;
			}
			conferenceVoiceBridge = userInfo.voiceBridge
			if (voiceBridge === "9196") {
				voiceBridge = voiceBridge + conferenceVoiceBridge;
			} else {
				voiceBridge = conferenceVoiceBridge;
			}
			console.log(callerIdName);
			webrtc_call(callerIdName, voiceBridge, callback, isListenOnly);
		});
	} else {
		if (voiceBridge === "9196") {
			voiceBridge = voiceBridge + conferenceVoiceBridge;
		} else {
			voiceBridge = conferenceVoiceBridge;
		}
		webrtc_call(callerIdName, voiceBridge, callback, isListenOnly);
	}
}

function joinWebRTCVoiceConference() {
	console.log("Joining to the voice conference directly");
	inEchoTest = false;
	// set proper callbacks to previously created user agent
	if(userAgent) {
		setUserAgentListeners(webRTCCallback);
	}
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
		if (userAgent != null) {
			var userAgentTemp = userAgent;
			userAgent = null;
			userAgentTemp.stop();
		}
	}, 5000);
	
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

function createUA(username, server, callback, makeCallFunc) {
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
		stunsConfig['stunServers'] = ( data['stunServers'] ? data['stunServers'].map(function(data) {
			return data['url'];
		}) : [] );
		stunsConfig['turnServers'] = ( data['turnServers'] ? data['turnServers'].map(function(data) {
			return {
				'urls': data['url'],
				'username': data['username'],
				'password': data['password']
			};
		}) : [] );
		createUAWithStuns(username, server, callback, stunsConfig, makeCallFunc);
	}).fail(function(data, textStatus, errorThrown) {
		BBBLog.error("Could not fetch stun/turn servers", {error: textStatus, user: callerIdName, voiceBridge: conferenceVoiceBridge});
		callback({'status':'failed', 'errorcode': 1009});
	});
}

function createUAWithStuns(username, server, callback, stunsConfig, makeCallFunc) {
	console.log("Creating new user agent");

	/* VERY IMPORTANT 
	 *	- You must escape the username because spaces will cause the connection to fail
	 *	- We are connecting to the websocket through an nginx redirect instead of directly to 5066
	 */
	var configuration = {
		uri: 'sip:' + encodeURIComponent(username) + '@' + server,
		wsServers: ('https:' == document.location.protocol ? 'wss://' : 'ws://')  + server + '/ws',
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
	setUserAgentListeners(callback, makeCallFunc);
	userAgent.start();
};

function setUserAgentListeners(callback, makeCallFunc) {
	console.log("reseting UA callbacks");
	userAgent.off('connected');
	userAgent.on('connected', function() {
		uaConnected = true;
		makeCallFunc();
	});
	userAgent.off('disconnected');
	userAgent.on('disconnected', function() {
		if (userAgent) {
			if (userAgent != null) {
				var userAgentTemp = userAgent;
				userAgent = null;
				userAgentTemp.stop();
			}
			
			if (uaConnected) {
				callback({'status':'failed', 'errorcode': 1001}); // WebSocket disconnected
			} else {
				callback({'status':'failed', 'errorcode': 1002}); // Could not make a WebSocket connection
			}
		}
	});
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

function webrtc_call(username, voiceBridge, callback, isListenOnly) {
	if (!isWebRTCAvailable()) {
		callback({'status': 'failed', 'errorcode': 1003}); // Browser version not supported
		return;
	}
	if (isListenOnly == null) { // assume NOT listen only unless otherwise stated
		isListenOnly = false;
	}

	var server = window.document.location.hostname;
	console.log("user " + username + " calling to " +  voiceBridge);

	var makeCallFunc = function() {
		// only make the call when both microphone and useragent have been created
		// for listen only, stating listen only is a viable substitute for acquiring user media control
		if ((isListenOnly||userMicMedia) && userAgent)
			make_call(username, voiceBridge, server, callback, false, isListenOnly);
	};

	// Reset userAgent so we can successfully switch between listenOnly and listen+speak modes
	userAgent = null;
	if (!userAgent) {
		createUA(username, server, callback, makeCallFunc);
	}
	// if the user requests to proceed as listen only (does not require media) or media is already acquired,
	// proceed with making the call
	if (isListenOnly || userMicMedia !== undefined) {
		makeCallFunc();
	} else {
		callback({'status':'mediarequest'});
		getUserMicMedia(function(stream) {
				console.log("getUserMicMedia: success");
				userMicMedia = stream;
				callback({'status':'mediasuccess'});
				makeCallFunc();
			}, function(e) {
				console.error("getUserMicMedia: failure - " + e);
				callback({'status':'mediafail', 'cause': e});
			}
		);
	}
}

function make_call(username, voiceBridge, server, callback, recall, isListenOnly) {
	if (isListenOnly == null) {
		isListenOnly = false;
	}

	if (userAgent == null) {
		console.log("userAgent is still null. Delaying call");
		var callDelayTimeout = setTimeout( function() {
			make_call(username, voiceBridge, server, callback, recall, isListenOnly);
		}, 100);
		return;
	}

	if (!userAgent.isConnected()) {
		console.log("Trying to make call, but UserAgent hasn't connected yet. Delaying call");
		userAgent.once('connected', function() {
			console.log("UserAgent has now connected, retrying the call");
			make_call(username, voiceBridge, server, callback, recall, isListenOnly);
		});
		return;
	}

	if (currentSession) {
		console.log('Active call detected ignoring second make_call');
		return;
	}

	// Make an audio/video call:
	console.log("Setting options.. ");

	var options = {};
	if (isListenOnly) {
		// create necessary options for a listen only stream
		var stream = null;
		// handle the web browser
		// create a stream object through the browser separated from user media
		if (typeof webkitMediaStream !== 'undefined') {
			// Google Chrome
			stream = new webkitMediaStream;
		} else {
			// Firefox
			audioContext = new window.AudioContext;
			stream = audioContext.createMediaStreamDestination().stream;
		}

		options = {
			media: {
				stream: stream, // use the stream created above
				render: {
					remote: {
						// select an element to render the incoming stream data
						audio: document.getElementById('remote-media')
					}
				}
			},
			// a list of our RTC Connection constraints
			RTCConstraints: {
				// our constraints are mandatory. We must received audio and must not receive audio
				mandatory: {
					OfferToReceiveAudio: true,
					OfferToReceiveVideo: false
				}
			}
		};
	} else {
		options = {
			media: {
				stream: userMicMedia,
				render: {
					remote: {
						audio: document.getElementById('remote-media')
					}
				}
			}
		};
	}
	
	callTimeout = setTimeout(function() {
		console.log('Ten seconds without updates sending timeout code');
		callback({'status':'failed', 'errorcode': 1006}); // Failure on call
		currentSession = null;
		if (userAgent != null) {
			var userAgentTemp = userAgent;
			userAgent = null;
			userAgentTemp.stop();
		}
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
	
	iceGatheringTimeout = setTimeout(function() {
		console.log('Thirty seconds without ICE gathering finishing');
		callback({'status':'failed', 'errorcode': 1011}); // ICE Gathering Failed
		currentSession = null;
		if (userAgent != null) {
			var userAgentTemp = userAgent;
			userAgent = null;
			userAgentTemp.stop();
		}
	}, 30000);
	
	currentSession.mediaHandler.on('iceComplete', function() {
		clearTimeout(iceGatheringTimeout);
	});
	
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
				if (userAgent != null) {
					var userAgentTemp = userAgent;
					userAgent = null;
					userAgentTemp.stop();
				}
			} else {
				callActive = false;
				//currentSession.bye();
				currentSession = null;
				if (userAgent != null) {
					userAgent.stop();
				}
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
			console.log('Waiting for ICE negotiation');
			iceConnectedTimeout = setTimeout(function() {
				console.log('60 seconds without ICE finishing');
				callback({'status':'failed', 'errorcode': 1010}); // ICE negotiation timeout
				currentSession = null;
				if (userAgent != null) {
					var userAgentTemp = userAgent;
					userAgent = null;
					userAgentTemp.stop();
				}
			}, 60000);
		}
		clearTimeout(callTimeout);
	});
	currentSession.mediaHandler.on('iceFailed', function() {
		console.log('received ice negotiation failed');
		callback({'status':'failed', 'errorcode': 1007}); // Failure on call
		currentSession = null;
		clearTimeout(iceConnectedTimeout);
		if (userAgent != null) {
			var userAgentTemp = userAgent;
			userAgent = null;
			userAgentTemp.stop();
		}
		
		clearTimeout(callTimeout);
	});
	
	// Some browsers use status of 'connected', others use 'completed', and a couple use both
	
	currentSession.mediaHandler.on('iceConnected', function() {
		console.log('Received ICE status changed to connected');
		if (callICEConnected === false) {
			callICEConnected = true;
			clearTimeout(iceConnectedTimeout);
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
			clearTimeout(iceConnectedTimeout);
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

function getCallStatus() {
	return currentSession;
}

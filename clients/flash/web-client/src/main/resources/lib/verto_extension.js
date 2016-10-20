var callback = function(message){console.log(message);}; // holds the user's callback for a global scope
callbacks = {};
var callICEConnected = false;
var callPurposefullyEnded = false; // used to determine whether the user ended the call or the call was ended from somewhere else outside
var callTimeout = null; // function that will run if there is no call established
var toDisplayDisconnectCallback = true; // if a call is dropped only display the error the first time
var wasCallSuccessful = false; // when the websocket connection is closed this determines whether a call was ever successfully established
webcamStream = "webcamStream";
window[webcamStream] = null;
verto = null;
videoTag = null;

// receives either a string variable holding the name of an actionscript
// registered callback, or a javascript function object.
// The function will return either the function if it is a javascript Function
// or if it is an actionscript string it will return a javascript Function
// that when invokved will invoke the actionscript registered callback
// and passes along parameters
function normalizeCallback(callback) {
	if (typeof callback == "function") {
		return callback;
	} else {
		return function(args) {
			document.getElementById("BigBlueButton")[callback](args);
		};
	}
}

// save a copy of the hangup function registered for the verto object
var oldHangup = $.verto.prototype.hangup;
// overwrite the verto hangup handler with my own handler
$.verto.prototype.hangup = function(callID, userCallback) {
	console.log("call state callbacks - bye");
	if (userCallback) {
		callback = userCallback;
	}
	callActive = false;

	if (cur_call) {
		console.log('call ended ' + cur_call.audioStream.currentTime); // the duration of the call
		if (callPurposefullyEnded === true) { // the user ended the call themself
			callback({'status':'ended'});
		} else {
			callback({'status':'failed', 'errorcode': 1005}); // Call ended unexpectedly
		}
		clearTimeout(callTimeout);
		cur_call = null;
	} else {
		console.log('bye event already received');
	}
	// call the original hangup procedure
	return oldHangup.apply(this, arguments);
}

// main entry point to making a verto call
callIntoConference_verto = function(voiceBridge, conferenceUsername, conferenceIdNumber, userCallback, videoTag, options, vertoServerCredentials) {
	window.videoTag = videoTag;
	// stores the user's callback in the global scope
	if (userCallback) {
		callback = userCallback;
	}
	if(!isLoggedIntoVerto()) { // start the verto log in procedure
		// runs when a web socket is disconnected
		callbacks.onWSClose = function(v, success) {
			if(wasCallSuccessful) { // a call was established through the websocket
				if(toDisplayDisconnectCallback) { // will only display the error the first time
					// the connection was dropped in an already established call
					console.log("websocket disconnected");
					callback({'status':'failed', 'errorcode': 1001}); // WebSocket disconnected
					toDisplayDisconnectCallback = false;
				}
			} else {
				// this callback was triggered and a call was never successfully established
				console.log("websocket connection could not be established");
				callback({'status':'failed', 'errorcode': 1002}); // Could not make a WebSocket connection
			}
		}
		// runs when the websocket is successfully created
		callbacks.onWSLogin = function(v, success) {
			cur_call = null;
			ringing = false;
			console.log("Inside onWSLogin");

			if (success) {
				console.log("starting call");
				toDisplayDisconnectCallback = true; // yes, display an error if the socket closes
				wasCallSuccessful = true; // yes, a call was successfully established through the websocket
				webrtc_call_verto(voiceBridge, conferenceUsername, conferenceIdNumber, callback, options);
			} else {
				callback({'status':'failed', 'errorcode': '10XX'}); // eror logging verto into freeswitch
			}
		}
		// set up verto
		// $.verto.init({}, init(videoTag));
		init(videoTag, vertoServerCredentials);
	} else {
		console.log("already logged into verto, going straight to making a call");
		webrtc_call_verto(voiceBridge, conferenceUsername, conferenceIdNumber, callback, options);
	}
}

checkSupport = function(callback) {
	if(!isWebRTCAvailable_verto()) {
		callback({'status': 'failed', 'errorcode': 1003}); // Browser version not supported
	}

	if (!navigator.getUserMedia) {
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
	}

	if (!navigator.getUserMedia){
		callback({'status': 'failed', 'errorcode': '10XX'}); // getUserMedia not supported in this browser
	}
}

configStuns = function(callbacks, callback, videoTag, vertoServerCredentials) {
	console.log("Fetching STUN/TURN server info for Verto initialization");
	var stunsConfig = {};
	$.ajax({
		dataType: 'json',
		url: '/bigbluebutton/api/stuns/'
	}).done(function(data) {
		console.log("ajax request done");
		console.log(data);
		if(data['response'] && data.response.returncode == "FAILED") {
			console.error(data.response.message);
			callback({'status':'failed', 'errorcode': data.response.message});
			return;
		}
		stunsConfig['stunServers'] = ( data['stunServers'] ? data['stunServers'].map(function(data) {
			return {'url': data['url']};
		}) : [] );
		stunsConfig['turnServers'] = ( data['turnServers'] ? data['turnServers'].map(function(data) {
			return {
				'urls': data['url'],
				'username': data['username'],
				'credential': data['password']
			};
		}) : [] );
		stunsConfig = stunsConfig['stunServers'].concat(stunsConfig['turnServers']);
		console.log("success got stun data, making verto");
		makeVerto(callbacks, stunsConfig, videoTag, vertoServerCredentials);
	}).fail(function(data, textStatus, errorThrown) {
		// BBBLog.error("Could not fetch stun/turn servers", {error: textStatus, user: callerIdName, voiceBridge: conferenceVoiceBridge});
		callback({'status':'failed', 'errorcode': 1009});
		return;
	});
}

docall_verto = function(extension, conferenceUsername, conferenceIdNumber, callbacks, options) {
	console.log(extension + ", " + conferenceUsername + ", " + conferenceIdNumber);

	if (cur_call) { // only allow for one call
		console.log("Quitting: Call already in progress");
		return;
	}
	// determine the resolution the user chose for webcam video
	my_check_vid_res();
	outgoingBandwidth = "default";
	incomingBandwidth = "default";
	var useVideo = useCamera = useMic = false;
	// debugger;
	if(options.watchOnly) {
		window.watchOnly = true;
		window.listenOnly = false;
		window.joinAudio = false;
		useVideo = true;
		useCamera = false;
		useMic = false;
	} else if(options.listenOnly) {
		window.listenOnly = true;
		window.watchOnly = false;
		window.joinAudio = false;
		useVideo = false;
		useCamera = false;
		useMic = false;
	} else if(options.joinAudio) {
		window.joinAudio = true;
		window.watchOnly = false;
		window.listenOnly = false;
		useVideo = false;
		useCamera = false;
		useMic = true;
	}

	cur_call = verto.newCall({
		destination_number: extension,
		caller_id_name: conferenceUsername,
		caller_id_number: conferenceIdNumber,
		outgoingBandwidth: outgoingBandwidth,
		incomingBandwidth: incomingBandwidth,
		useStereo: true,
		useVideo: useVideo,
		useCamera: useCamera,
		useMic: useMic,
		dedEnc: false,
		mirrorInput: false
	});

	if (callbacks != null) { // add user supplied callbacks to the current call
		cur_call.rtc.options.callbacks = $.extend(cur_call.rtc.options.callbacks, callbacks);
	}
}

// check if logged into verto by seeing if there is a ready websocket connection
function isLoggedIntoVerto() {
	return (verto != null ? (ref = verto.rpcClient) != null ? ref.socketReady() : void 0 : void 0);
}

// overwrite and substitute my own init function
init = function(videoTag, vertoServerCredentials) {
	videoTag = window.videoTag;
	cur_call = null;
	share_call = null;
	incomingBandwidth = "default";
	configStuns(callbacks, callback, videoTag, vertoServerCredentials);
}

// checks whether Google Chrome or Firefox have the WebRTCPeerConnection object
function isWebRTCAvailable_verto() {
	return (typeof window.webkitRTCPeerConnection !== 'undefined' || typeof window.mozRTCPeerConnection !== 'undefined');
}

// exit point for conference
function leaveWebRTCVoiceConference_verto() {
	console.log("Leaving the voice conference");
	webrtc_hangup_verto();
}

function make_call_verto(voiceBridge, conferenceUsername, conferenceIdNumber, userCallback, server, recall, options) {
	if (userCallback) {
		callback = userCallback;
	}
	callPurposefullyEnded = false;

	// after 15 seconds if a call hasn't been established display error, hangup and logout of verto
	callTimeout = setTimeout(function() {
		console.log('Ten seconds without updates sending timeout code');
		callback({'status':'failed', 'errorcode': 1006}); // Failure on call
		if (verto != null) {
			verto.hangup();
			verto.logout();
			verto = null;
		}
		cur_call = null;
	}, 10000*1.5);

	var myRTCCallbacks = {
		onError: function(vertoErrorObject, errorMessage) {
			console.error("custom callback: onError");
			console.error(vertoErrorObject);
			console.error("ERROR:");
			console.error(errorMessage);
			if(errorMessage.name === "PermissionDeniedError") { // user denied access to media peripherals
				console.error("User denied permission/access to hardware");
				console.error("getUserMedia: failure - ", errorMessage);
				callback({'status': 'mediafail', 'cause': errorMessage});
			}
			cur_call.hangup({cause: "Device or Permission Error"});
			clearTimeout(callTimeout);
		},
		onICEComplete: function(self, candidate) { // ICE candidate negotiation is complete
			console.log("custom callback: onICEComplete");
			console.log('Received ICE status changed to completed');
			if (callICEConnected === false) {
				callICEConnected = true;
				if (callActive === true) {
					callback({'status':'started'});
				}
				clearTimeout(callTimeout);
			}
		},
		onStream: function(rtc, stream) { // call has been established
			console.log("getUserMicMedia: success");
			callback({'status':'mediasuccess'});
			console.log("custom callback: stream started");
			callActive = true;
			console.log('BigBlueButton call accepted');

			if (callICEConnected === true) {
				callback({'status':'started'});
			} else {
				callback({'status':'waitingforice'});
			}
			clearTimeout(callTimeout);
		}
	};

	if(isLoggedIntoVerto()) {
		console.log("Verto is logged into FreeSWITCH, socket is available, making call");
		callICEConnected = false;

		docall_verto(voiceBridge, conferenceUsername, conferenceIdNumber, myRTCCallbacks, options);

		if(recall === false) {
			console.log('call connecting');
			callback({'status': 'connecting'});
		} else {
			console.log('call connecting again');
		}

		callback({'status':'mediarequest'});
	} else {
		console.error("Verto is NOT logged into FreeSWITCH, socket is NOT available, abandoning call request");
	}
}

function makeVerto(callbacks, stunsConfig, videoTag, vertoServerCredentials) {
	var vertoPort = vertoServerCredentials.vertoPort;
	var hostName = vertoServerCredentials.hostName;
	var socketUrl = "wss://" + hostName + ":" + vertoPort;
	var login = vertoServerCredentials.login;
	var password = vertoServerCredentials.password;
	var minWidth = "640";
	var minHeight = "480";
	var maxWidth = "1920";
	var maxHeight = "1080";

	console.log("stuns info is");
	console.log(stunsConfig);
	// debugger;
	verto = new $.verto({
		login: login,
		passwd: password,
		socketUrl: socketUrl,
		tag: videoTag,
		ringFile: "sounds/bell_ring2.wav",
		loginParams: {foo: true, bar: "yes"},
		useVideo: false,
		useCamera: false,
		iceServers: stunsConfig, // use user supplied stun configuration
		// iceServers: true, // use stun, use default verto configuration
	}, callbacks);
}

// sets verto to begin using the resolution that the user selected
my_check_vid_res = function() {
	var selectedVideoConstraints = getChosenWebcamResolution();
	my_real_size(selectedVideoConstraints);

	if (verto) {
		verto.videoParams({
			"minWidth": selectedVideoConstraints.constraints.minWidth,
			"minHeight": selectedVideoConstraints.constraints.minHeight,
			"maxWidth": selectedVideoConstraints.constraints.maxWidth,
			"maxHeight": selectedVideoConstraints.constraints.maxHeight,
			"minFrameRate": selectedVideoConstraints.constraints.minFrameRate,
			"vertoBestFrameRate": selectedVideoConstraints.constraints.vertoBestFrameRate
		});
	}
}

my_real_size = function(selectedVideoConstraints) {
	$("#" + window.videoTag).height("100%");
	$("#" + window.videoTag).width("100%");
}

var RTCPeerConnectionCallbacks = {
	iceFailed: function(e) {
		console.log('received ice negotiation failed');
		callback({'status':'failed', 'errorcode': 1007}); // Failure on call
		//
		// TODO unless I do this, the call only lasts for a few seconds.
		// When I comment out the lines below, it works fine indefinitely
		// Anton Georgiev Dec 10 2015
		//
		//cur_call = null;
		//verto.hangup();
		//verto = null;
		//clearTimeout(callTimeout);
	}
};
this.RTCPeerConnectionCallbacks = RTCPeerConnectionCallbacks;

window.verto_afterStreamPublish = function() {}

function webrtc_call_verto(voiceBridge, conferenceUsername, conferenceIdNumber, userCallback, options) {
	if (userCallback) {
		callback = userCallback;
	}
	console.log("webrtc_call\n"+voiceBridge + ", " + conferenceUsername + ", " + conferenceIdNumber + ", " + callback);

	if(!isWebRTCAvailable()) {
		callback({'status': 'failed', 'errorcode': 1003}); // Browser version not supported
		return;
	}

	var server = window.document.location.hostname;
	console.log("user " + conferenceUsername + " calling to " +	voiceBridge);
	if (isLoggedIntoVerto()) {
		make_call_verto(voiceBridge, conferenceUsername, conferenceIdNumber, callback, "", false, options);
	}
}

function webrtc_hangup_verto(userCallback) {
	if (userCallback) {
		callback = userCallback;
	}
	callPurposefullyEnded = true;
	console.log("Hanging up current session");
	if(verto) {
		verto.hangup(false, callback);
	}
}

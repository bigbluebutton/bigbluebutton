var callback = function(message){console.log(message);}; // holds the user's callback for a global scope
var callICEConnected = false;
var callPurposefullyEnded = false; // used to determine whether the user ended the call or the call was ended from somewhere else outside
var callTimeout = null; // function that will run if there is no call established
var conferenceIdNumber = "1008";
var conferenceUsername = "FreeSWITCH User";
var toDisplayDisconnectCallback = true; // if a call is dropped only display the error the first time
var voiceBridge = extension = "3500";
var wasCallSuccessful = false; // when the websocket connection is closed this determines whether a call was ever successfully established

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
function callIntoConference(voiceBridge, conferenceUsername, conferenceIdNumber, userCallback) {
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
			display("");
			cur_call = null;
			ringing = false;
			console.log("Inside onWSLogin");

			if (success) {
				online(true);
				console.log("starting call");
				toDisplayDisconnectCallback = true; // yes, display an error if the socket closes
				wasCallSuccessful = true; // yes, a call was successfully established through the websocket
				webrtc_call(voiceBridge, conferenceUsername, conferenceIdNumber, callback);

				if (!window.location.hash) {
					goto_page("main");
				}
			} else {
				callback({'status':'failed', 'errorcode': '10XX'}); // eror logging verto into freeswitch
				goto_page("main");
				goto_dialog("login-error");
			}
		}
		// set up verto
		$.verto.init({}, init);
	} else {
		console.log("already logged into verto, going straight to making a call");
		webrtc_call(voiceBridge, conferenceUsername, conferenceIdNumber, callback);
	}
}

function configStuns(callbacks, callback) {
	console.log("Fetching STUN/TURN server info for Verto initialization");
	var stunsConfig = {};
	$.ajax({
		dataType: 'json',
		url: '/bigbluebutton/api/stuns/'
	}).done(function(data) {
		console.log("ajax request done");
		console.log(data);
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
		makeVerto(callbacks, stunsConfig);
	}).fail(function(data, textStatus, errorThrown) {
		// BBBLog.error("Could not fetch stun/turn servers", {error: textStatus, user: callerIdName, voiceBridge: conferenceVoiceBridge});
		callback({'status':'failed', 'errorcode': 1009});
		return;
	});
}

function docall(extension, conferenceUsername, conferenceIdNumber, callbacks) {
	console.log(extension + ", " + conferenceUsername + ", " + conferenceIdNumber);
	$('#ext').trigger('change');

	if (cur_call) { // only allow for one call
		console.log("Quitting: Call already in progress");
		return;
	}

	$("#main_info").html("Trying");

	check_vid_res();
	outgoingBandwidth = "5120";
	incomingBandwidth = "5120";

	cur_call = verto.newCall({
		destination_number: extension,
		caller_id_name: conferenceUsername,
		caller_id_number: conferenceIdNumber,
		outgoingBandwidth: outgoingBandwidth,
		incomingBandwidth: incomingBandwidth,
		useVideo: true,
		useStereo: true,
		useCamera: true,
		useMic: true,
		dedEnc: true,
		mirrorInput: true,
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
init = function() {
	cur_call = null;
	share_call = null;
	$(".sharediv").show();
	$("#camdiv").show();
	$("#use_vid").prop("checked", "true");
	incomingBandwidth = "default";
	vqual = "qvga";
	online(false);
	configStuns(callbacks, callback);
}

// checks whether Google Chrome or Firefox have the WebRTCPeerConnection object
function isWebRTCAvailable() {
	return (typeof window.webkitRTCPeerConnection !== 'undefined' || typeof window.mozRTCPeerConnection !== 'undefined');
}

// exit point for conference
function leaveWebRTCVoiceConference() {
	console.log("Leaving the voice conference");
	webrtc_hangup();
}

function make_call(voiceBridge, conferenceUsername, conferenceIdNumber, userCallback, server, recall) {
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
			console.log("current verto");
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

		docall(voiceBridge, conferenceUsername, conferenceIdNumber, myRTCCallbacks);

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

function makeVerto(callbacks, stunsConfig) {
	var vertoPort = "8082";
	var hostName = window.location.hostname;
	var socketUrl = "wss://" + hostName + ":" + vertoPort;
	var login = "1008";
	var password = "alpine";
	var minWidth = "1920";
	var minHeight = "1080";
	var maxWidth = "1920";
	var maxHeight = "1080";

	console.log("stuns info is");
	console.log(stunsConfig);

	check_vid_res();
	// create verto object and log in
	verto = new $.verto({
		login: login,
		passwd: password,
		socketUrl: socketUrl,
		tag: "webcam",
		ringFile: "sounds/bell_ring2.wav",
		loginParams: {foo: true, bar: "yes"},
		videoParams: {
			"minWidth": minWidth,
			"minHeight": minHeight,
			"maxWidth": maxWidth,
			"maxHeight": maxHeight,
		},
		iceServers: stunsConfig, // use user supplied stun configuration
		// iceServers: true, // use stun, use default verto configuration
	}, callbacks);
	refresh_devices();
}

var RTCPeerConnectionCallbacks = {
	iceFailed: function(e) {
		console.log('received ice negotiation failed');
		callback({'status':'failed', 'errorcode': 1007}); // Failure on call
		cur_call = null;
		verto.hangup();
		verto = null;
		clearTimeout(callTimeout);
	}
};

function webrtc_call(voiceBridge, conferenceUsername, conferenceIdNumber, userCallback) {
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
		make_call(voiceBridge, conferenceUsername, conferenceIdNumber, callback, "", false);
	}
}

function webrtc_hangup(userCallback) {
	if (userCallback) {
		callback = userCallback;
	}
	callPurposefullyEnded = true;
	console.log("Hanging up current session");
	verto.hangup(false, callback);
}

// supplement my own that insert my own button and handler
$(document).ready(function() {
	$("body").append("<button id='joinAudio' style='position:absolute; top:0px; left:0px; width:500px; height:30px;'>joinAudio</button>");
	$("#joinAudio").click(function() {
		wasCallSuccessful = false;
		var debuggerCallback = function(message) {
			console.log("CALLBACK: "+JSON.stringify(message));
		}
		callIntoConference(extension, conferenceUsername, conferenceIdNumber, debuggerCallback);
	});

	$("body").append("<button id='hangUp' style='position:absolute; top:30px; left:0px; width:500px; height:30px;'>hangUp</button>");
	$("#hangUp").click(function() {
		console.log("hangup button");
		leaveWebRTCVoiceConference();
		cur_call = null;
	});

	$("body").append("<button id='shareScreen' style='position:absolute; top:60px; left:0px; width:500px; height:30px;'>shareScreen</button>");
	$("#shareScreen").click(function() {
		console.log("shareScreen button");
		screenStart(true, function(){});
		$("#shareScreen").hide();
		$("#stopScreen").show();
	});

	$("body").append("<button id='stopScreen' style='position:absolute; top:60px; left:0px; width:500px; height:30px;'>stopScreen</button>");
	$("#stopScreen").click(function() {
		console.log("stopScreen button");
		screenStart(false, function(){});
		$("#shareScreen").show();
		$("#stopScreen").hide();
	});
	$("#stopScreen").hide();
});

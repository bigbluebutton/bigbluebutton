{
    var BBBClientCheck = {};
	var userAgent;
	var userMicMedia;
	var currentSession;
    
    function getSwfObj() {
		return swfobject.getObjectById('BBBClientCheck');
	}
    
	BBBClientCheck.userAgent = function(){
		var userAgentInfo = ''; 
		var swfObj = getSwfObj();
		
		userAgentInfo = navigator.userAgent;
		swfObj.userAgent(userAgentInfo);
	}
	
	BBBClientCheck.browser = function() {
	
		var nVer = navigator.appVersion;
        var nAgt = navigator.userAgent;	
		var browserInfo, nameOffset, verOffset, ix;
		var browser = navigator.appName;
        var version = '' + parseFloat(navigator.appVersion);
		var swfObj = getSwfObj();
		
		// taken from http://stackoverflow.com/a/18706818/1729349
		
		// Opera
        if ((verOffset = nAgt.indexOf('Opera')) != -1) {
            browser = 'Opera';
            version = nAgt.substring(verOffset + 6);
            if ((verOffset = nAgt.indexOf('Version')) != -1) {
                version = nAgt.substring(verOffset + 8);
            }
        }
        // MSIE
        else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
            browser = 'Microsoft Internet Explorer';
            version = nAgt.substring(verOffset + 5);
        }

        //IE 11 no longer identifies itself as MS IE, so trap it
        //http://stackoverflow.com/questions/17907445/how-to-detect-ie11
        else if ((browser == 'Netscape') && (nAgt.indexOf('Trident/') != -1)) {

            browser = 'Microsoft Internet Explorer';
            version = nAgt.substring(verOffset + 5);
            if ((verOffset = nAgt.indexOf('rv:')) != -1) {
                version = nAgt.substring(verOffset + 3);
            }

        }

        // Chrome
        else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
            browser = 'Chrome';
            version = nAgt.substring(verOffset + 7);
        }
        // Safari
        else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
            browser = 'Safari';
            version = nAgt.substring(verOffset + 7);
            if ((verOffset = nAgt.indexOf('Version')) != -1) {
                version = nAgt.substring(verOffset + 8);
            }

            // Chrome on iPad identifies itself as Safari. Actual results do not match what Google claims
            //  at: https://developers.google.com/chrome/mobile/docs/user-agent?hl=ja
            //  No mention of chrome in the user agent string. However it does mention CriOS, which presumably
            //  can be keyed on to detect it.
            if (nAgt.indexOf('CriOS') != -1) {
                //Chrome on iPad spoofing Safari...correct it.
                browser = 'Chrome';
                //Don't believe there is a way to grab the accurate version number, so leaving that for now.
            }
        }
        // Firefox
        else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
            browser = 'Firefox';
            version = nAgt.substring(verOffset + 8);
        }
        // Other browsers
        else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
            browser = nAgt.substring(nameOffset, verOffset);
            version = nAgt.substring(verOffset + 1);
            if (browser.toLowerCase() == browser.toUpperCase()) {
                browser = navigator.appName;
            }
        }
		
		// trim the version string
        if ((ix = version.indexOf(';')) != -1) version = version.substring(0, ix);
        if ((ix = version.indexOf(' ')) != -1) version = version.substring(0, ix);
        if ((ix = version.indexOf(')')) != -1) version = version.substring(0, ix);

		browserInfo = browser + " " + version;
		swfObj.browser(browserInfo);
	}
	
	BBBClientCheck.screenSize = function(){
		var screenSizeInfo = '';
		var swfObj = getSwfObj();
		
        if (screen.width !== undefined) {
            width = (screen.width) ? screen.width : '';
            height = (screen.height) ? screen.height : '';
            screenSizeInfo += '' + width + " x " + height;
        }

		swfObj.screenSize(screenSizeInfo);
	}
	
	BBBClientCheck.flashVersion = function(){
		var flashVersionInfo = ''; 
		var swfObj = getSwfObj();
		
		flashVersionInfo = swfobject.getFlashPlayerVersion();
		
		 if (flashVersionInfo.major > 0) {
            flashVersionInfo = flashVersionInfo.major + '.' + flashVersionInfo.minor + ' r' + flashVersionInfo.release;
        } 

		swfObj.flashVersion(flashVersionInfo);
	}
	
	BBBClientCheck.isPepperFlash = function(){
		var isPepperFlashInfo = false;
		var swfObj = getSwfObj();
		
		var isPPAPI = false;
		var type = 'application/x-shockwave-flash';
		var mimeTypes = navigator.mimeTypes;
		
		if (mimeTypes && mimeTypes[type] && mimeTypes[type].enabledPlugin && (mimeTypes[type].enabledPlugin.filename.match(/pepflashplayer|Pepper/gi))) {
			isPepperFlashInfo = true;
		}
		
		swfObj.isPepperFlash(isPepperFlashInfo);
	}
	
	BBBClientCheck.cookieEnabled = function(){
		var cookieEnabledInfo = ''; 
		var swfObj = getSwfObj();
		
		cookieEnabledInfo = navigator.cookieEnabled;
		swfObj.cookieEnabled(cookieEnabledInfo);
	}
	
	BBBClientCheck.javaEnabled = function(){
		var result = {
			enabled: navigator.javaEnabled(),
			version: [],
			minimum: '1.7.0_51+',
			appropriate: false
		};

		if (result.enabled) {
			result.version = getJavaVersion();
			result.appropriate = isJavaVersionAppropriateForDeskshare(result.minimum);
		}

		console.log(result);

		var swfObj = getSwfObj();
		swfObj.javaEnabled(result);
	}

	function getJavaVersion() {
		return deployJava.getJREs();
	}

	function isJavaVersionAppropriateForDeskshare(required) {
		return deployJava.versionCheck(required);
	}

	BBBClientCheck.language = function(){ 
		var languageInfo = '';
		var swfObj = getSwfObj();
		
		languageInfo = navigator.language;
		swfObj.language(languageInfo);
	}
	
	BBBClientCheck.isWebRTCSupported = function() {
		var isWebRTCSupportedInfo = SIP.WebRTC.isSupported();
		var swfObj = getSwfObj();
		
		swfObj.isWebRTCSupported(isWebRTCSupportedInfo);
	}
	
	BBBClientCheck.webRTCEchoAndSocketTest = function() { 
		startWebRTCAudioTest();
	}

	function startWebRTCAudioTest() {
		console.log("Starting WebRTC audio test...");
		var swfObj = getSwfObj();
		
		var callback = function(message) { 
			switch(message.status) {
				case 'websocketFailed':
					console.log("websocketFailed");
					swfObj.webRTCSocketTest(false, message.cause);
					break;
				case 'websocketSuccess':
					console.log("websocketSuccess");
					swfObj.webRTCSocketTest(true, 'Connected');
					break;
				case 'failed':
					swfObj.webRTCEchoTest(false, message.cause);
					console.log("call failed");
					break;
				case 'ended':
					console.log("call ended");
					break;
				case 'started':
					console.log("call started");
					swfObj.webRTCEchoTest(true, 'Connected');
					break;
				case 'mediasuccess':
					console.log("call mediasuccess");
					break;
				case 'mediafail':
					console.log("call mediafail");
					break;
			}
		}
		
		var callerIdName = "12345" + "-bbbID-" + "bbbTestUser";
		webrtc_call(callerIdName, "9196", callback);
	}
	
	function createUA(username, server, callback) {
		
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
		
		console.log("Creating SIP.UA");
		
		userAgent = new SIP.UA(configuration);
		
		userAgent.on('disconnected', function() {
			if (userAgent !== undefined) { 
				userAgent.stop();
				userAgent = null;
				callback({status: 'websocketFailed', cause: 'Could not make a WebSocket Connection'});
			}
		});
		
		userAgent.on('connected', function() { 
			callback({status: 'websocketSuccess'});
		});
		
		userAgent.start();
	}
	
	function make_call(username, voiceBridge, server, callback) {
		
		var audioContext = new (window.AudioContext || window.webkitAudioContext)();
		var silentStream = audioContext.createMediaStreamDestination().stream;
		
		console.log("Setting options.. ");
		var options = { 
			media: {
				stream: silentStream,
				render: { 
					remote: {
						audio: document.getElementById('remote-media')
					}
				}
			}
		};
	
		console.log("Calling to " + voiceBridge + "....");
		currentSession = userAgent.invite('sip:' + voiceBridge + '@' + server, options);
		
		console.log("Call connecting...");
		
		currentSession.on('failed', function(response, cause) {
			console.log('call failed with the case ' + casuse);
			callback({status: 'failed', cause: cause});
		});
		
		currentSession.on('bye', function(request) {
			console.log('call ended ' + currentSession.endTime);
			callback({status: 'ended'}) 
		});
	
		currentSession.on('accepted', function(data) {
			console.log('BigBlueClient Test Call started');
			callback({status: 'started'});
		});
	}
	
	function webrtc_call(username, voiceBridge, callback) {
		console.log("webrtc_call started...");
		
		if (!SIP.WebRTC.isSupported()) {
			callback({status: "failed", cause: "Browser version not supported" });
		}
		
		var server = window.document.location.host;
		console.log("webrtc_call server: " + server);
		
		if(userAgent == undefined) {
			createUA(username, server, callback);
		}
		else {
			callback({status: 'websocketSuccess'});
		}
		
		make_call(username, voiceBridge, server, callback);
	}
	
	function getUserMicMedia(getUserMediaSuccess, getUserMicMediaFail) {
		if (userMicMedia == undefined) {
			SIP.WebRTC.getUserMedia({audio:true, video:false}, getUserMediaSuccess, getUserMicMediaFail);
		} else {
			getUserMicMediaSuccess(userMicMedia);
		}
	}
}

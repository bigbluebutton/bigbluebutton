{
    var BBBClientCheck = {};
	var BBB = {};
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

		var result = {
			browser: browser,
			version: version
		};

		swfObj.browser(result);
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
		var isWebRTCSupportedInfo = isWebRTCAvailable();
		var swfObj = getSwfObj();
		
		swfObj.isWebRTCSupported(isWebRTCSupportedInfo);
	}
	
	BBBClientCheck.webRTCEchoAndSocketTest = function() { 
		var audioContext = new (window.AudioContext || window.webkitAudioContext)();
		var silentStream = audioContext.createMediaStreamDestination().stream;

		userMicMedia = silentStream;

		startWebRTCAudioTest();
	}

	function sendWebRTCEchoTestAnswer(success, errorcode) {
		var swfObj = getSwfObj();
		swfObj.webRTCEchoTest(success, errorcode);

		if (callActive === true) {
			leaveWebRTCVoiceConference();
		}
	}

	BBB.getMyUserInfo = function(callback) {
		var obj = {
			myUserID: "12345",
			myUsername: "bbbTestUser",
			myAvatarURL: "undefined",
			myRole: "undefined",
			amIPresenter: "undefined",
			dialNumber: "undefined",
			voiceBridge: "00000",
			customdata: "undefined"
		}

		callback(obj);
	}

	// webrtc test callbacks
	BBB.webRTCCallSucceeded = function() {
		console.log("[BBBClientCheck] Handling webRTCCallSucceeded");
		var swfObj = getSwfObj();
		swfObj.webRTCSocketTest(true, 'Connected');
	}

	BBB.webRTCCallFailed = function(inEchoTest, errorcode, cause) {
		console.log("[BBBClientCheck] Handling webRTCCallFailed, errorcode " + errorcode + ", cause: " + cause);
		if (errorcode == 1002) {
			// failed to connect the websocket
			var swfObj = getSwfObj();
			swfObj.webRTCSocketTest(false, errorcode);
		} else {
			sendWebRTCEchoTestAnswer(false, errorcode);
		}
	}

	BBB.webRTCCallEnded = function(inEchoTest) {
		console.log("[BBBClientCheck] Handling webRTCCallEnded");
	}

	BBB.webRTCCallStarted = function(inEchoTest) {
		console.log("[BBBClientCheck] Handling webRTCCallStarted");
		sendWebRTCEchoTestAnswer(true, 'Connected');
	}

	BBB.webRTCCallConnecting = function(inEchoTest) {
		console.log("[BBBClientCheck] Handling webRTCCallConnecting");
	}

	BBB.webRTCCallWaitingForICE = function(inEchoTest) {
		console.log("[BBBClientCheck] Handling webRTCCallWaitingForICE");
	}

	BBB.webRTCCallTransferring = function(inEchoTest) {
		console.log("[BBBClientCheck] Handling webRTCCallTransferring");
	}

	BBB.webRTCMediaRequest = function() {
		console.log("[BBBClientCheck] Handling webRTCMediaRequest");
	}

	BBB.webRTCMediaSuccess = function() {
		console.log("[BBBClientCheck] Handling webRTCMediaSuccess");
	}

	BBB.webRTCMediaFail = function() {
		console.log("[BBBClientCheck] Handling webRTCMediaFail");
	}
}

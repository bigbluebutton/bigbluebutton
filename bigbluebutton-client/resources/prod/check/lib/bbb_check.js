(function(window, undefined) {

  var BBBCheck = {};

  /**
     * Internal function to get the BBB embed object. Seems like we have to do this
     * each time and can't create a var for it.
     *
     * To get the object, see https://code.google.com/p/swfobject/wiki/api
  */
  function getSwfObj() {
    return swfobject.getObjectById("MicrophoneCheck");
  }
  
  function getConnObj() {
    return swfobject.getObjectById("RTMPConnCheck");
  }
    
  BBBCheck.getFlashPlayerVersion = function() {
    return swfobject.getFlashPlayerVersion();
  }
  
  BBBCheck.hasMinFlashPlayerVersion = function(flashVersion) {
     return swfobject.hasFlashPlayerVersion(flashVersion);
  }
  
  BBBCheck.getBrowser = function() {
    return deployJava.getBrowser();
  }
  
  BBBCheck.getJREs = function() {
    return deployJava.getJREs();
  }
  
  BBBCheck.installJRE = function(version) {
    deployJava.installJRE(version);
  }
  
  BBBCheck.installLatestJRE = function() {
    deployJava.installLatestJRE();
  }
  
  BBBCheck.runApplet = function(attributes, parameters, minimumVersion) {
    deployJava.runApplet(attributes, parameters, minimumVersion);
  }

  BBBCheck.runApplet = function(attributes, parameters, minimumVersion) {
    deployJava.runApplet(attributes, parameters, minimumVersion);
  }

  BBBCheck.showCamSettings = function() {
    var swfObj = getSwfObj();
    if (swfObj) { 
      swfObj.showCamSettings();
    }
  }
  
  BBBCheck.showMicSettings = function() {
    var swfObj = getSwfObj();
    if (swfObj) { 
      swfObj.showMicSettings();
    }
  }

  BBBCheck.startTestMicrophone = function() {
    var swfObj = getSwfObj();
    if (swfObj) { 
      swfObj.startTestMicrophone();
    }
  }

  BBBCheck.stopTestMicrophone = function() {
    var swfObj = getSwfObj();
    if (swfObj) { 
      swfObj.stopTestMicrophone();
    }
  }
  
  BBBCheck.testRTMPConnection = function(host, app) {
    var swfObj = getConnObj();
    if (swfObj) { 
      swfObj.testRTMPConnection(host, app);
    }
  }  
  
  BBBCheck.testSocketConnection = function(host, port) {
    var swfObj = getConnObj();
    if (swfObj) { 
      swfObj.testSocketConnection(host, port);
    }
  }
  
  BBBCheck.setSocketPolicyFileURL = function(url) {
    var swfObj = getConnObj();
    if (swfObj) { 
      swfObj.setPolicyFileURL(url);
    }
  }
  
  /*** Callbacks from Flash test apps **/
  BBBCheck.microphoneCheckAppReady = function() {
    console.log("microphone check app ready.");
    broadcast("MicCheckAppReadyEvent");
  }
  
  BBBCheck.noAvailableMicrophoneError = function() {
    console.log("no available microphone");
  }

  BBBCheck.microphoneAccessDenied = function() {
    console.log("Mic access has been denied.");
  }
  
  BBBCheck.microphoneAccessAllowed = function() {
    console.log("Mic access has been allowed.");
  }

  BBBCheck.camAccessDenied = function() {
    console.log("Cam access has been denied.");
  }
  
  BBBCheck.camAccessAllowed = function() {
    console.log("Cam access has been allowed.");
  }
  
  BBBCheck.invalidParamsForRtmpConnectionTest = function() {
    console.log("Invalid host or app for rtmp connection test.");
  }  

  BBBCheck.rtmpConnectionTestSuccess = function(rtmp, server, application) {
    console.log("Connection succeeded using rtmp[" + rtmp + "]");
  }

  BBBCheck.rtmpConnectionTestFailed = function(host, app) {
    console.log("Failed to connect to [" + host + "][" + app + "]");
  }

  BBBCheck.socketConnTestFailed = function(host, port) {
    console.log("Failed to connect to [" + host + "][" + port + "]");
  }

  BBBCheck.socketConnTestClosed = function(host, port) {
    console.log("Connection closed to [" + host + "][" + port + "]");
  }

  BBBCheck.socketConnTestSuccess = function(host, port) {
    console.log("Connection success to [" + host + "][" + port + "]");
  }

  BBBCheck.socketConnTestIOError = function(host, port) {
    console.log("Connection IO error to [" + host + "][" + port + "]");
  }

  BBBCheck.socketConnTestSecurityError = function(host, port) {
    console.log("Connection security error to [" + host + "][" + port + "]");
  }
  

  
    /* ***********************************************************************************
     *       Broadcasting of events to 3rd-party apps.
     *************************************************************************************/
    
    /** Stores the 3rd-party app event listeners ***/ 
    var listeners = {};

    /**
     * 3rd-party apps should user this method to register to listen for events.
     */
    BBBCheck.listen = function(eventName, handler) {
        if (typeof listeners[eventName] === 'undefined')
            listeners[eventName] = [];
        
        listeners[eventName].push(handler);
    };

    /**
     * 3rd-party app should use this method to unregister listener for a given event.
     */
    BBBCheck.unlisten = function(eventName, handler) {
        if (!listeners[eventName])
            return;
        
        for (var i = 0; i < listeners[eventName].length; i++) {
            if (listeners[eventName][i] === handler) {
                listeners.splice(i, 1);
                break;
            }
        }
    };

    /**
     * Private function to broadcast received event from the BigBlueButton Flash client to
     * 3rd-parties.
     */
    function broadcast(eventName, params) {
        if (!listeners[eventName]) {
            console.log("No listeners for [" + eventName + "]");        
            return;
        }
        
        for (var i = 0; i < listeners[eventName].length; i++) {
            console.log("Notifying listeners for [" + eventName + "]"); 
            if (params == null) {
              listeners[eventName][i]();
            } else {
              listeners[eventName][i](params);
            }
            
        }
    };
    
  window.BBBCheck = BBBCheck;
})(this);
 
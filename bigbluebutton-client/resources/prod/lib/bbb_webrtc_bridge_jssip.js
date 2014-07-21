
var bbbAudioConference;
var currentSession;

// Hang Up webrtc call
function webrtc_hangup(callback) {
      console.log("Terminating current session");
      currentSession.terminate(); // allows calling multiple times
      callback();
}

// Call 
function webrtc_call(username, voiceBridge, server, callback) {
    var sayswho = navigator.sayswho,
        browser = sayswho[0],
        version = +(sayswho[1].split('.')[0]);

    console.log("Browser: " + browser + ", version: " + version);
    if ( !( (browser == "Chrome" && version >= 28) || (browser == "Firefox" && version >= 26) ) ) {
        callback({'status': 'browserError', message: "Browser version not supported"});
        return;
    }

    server = server || window.document.location.host;
    console.log("user " + username + " calling to " +  voiceBridge);
    
    var configuration = {
         uri: 'sip:' + escape(username) + '@' + server,
      //   password: freeswitchPassword,
      //   ws_servers: 'wss://' + server + ':7443',
         ws_servers: 'ws://' + server + ':5066',         
         display_name: username,
      //   authorization_user: freeswitchUser,
         register: false,
      //   register_expires: null,
      //   no_answer_timeout: null,
         trace_sip: false,
         stun_servers: "stun:74.125.134.127:19302",
      //   turn_servers: null,
      //   use_preloaded_route: null,
      //   connection_recovery_min_interval: null,
      //   connection_recovery_max_interval: null,
      //   hack_via_tcp: null,
      //   hack_ip_in_contact: null
  };

  
  bbbAudioConference = new JsSIP.UA(configuration);
  
  bbbAudioConference.on('newRTCSession', function(e) {
      console.log("New Webrtc session created!");
      currentSession = e.data.session;
    });
    
  bbbAudioConference.start();
  // Make an audio/video call:
  // HTML5 <video> elements in which local and remote video will be shown
  var selfView =   document.getElementById('local-media');
  var remoteView =  document.getElementById('remote-media');

  console.log("Registering callbacks to desired call events..");
  var eventHandlers = {
    'progress': function(e){
      console.log('call is in progress: ' + e.data);
      callback({'status':'progress', 'message': e.data});
    },
    'failed': function(e){
      console.log('call failed with cause: '+ e.data.cause);
      callback({'status':'failed', 'cause': e.data.cause});
    },
    'ended': function(e){
      console.log('call ended with cause: '+ e.data.cause);
      callback({'status':'ended', 'cause': e.data.cause});
    },
    'started': function(e){
      var rtcSession = e.sender;
      var localStream = false;
      var remoteStream = false;

      console.log('BigBlueButton call started');

      // Attach local stream to selfView
      if (rtcSession.getLocalStreams().length > 0) {
        console.log("Got local stream");     
        localStream = true;   
      }

      // Attach remote stream to remoteView
      if (rtcSession.getRemoteStreams().length > 0) {
        console.log("Got remote stream");
        remoteView.src = window.URL.createObjectURL(rtcSession.getRemoteStreams()[0]);
        remoteStream = true;
      }
      callback({'status':'started', 'localStream': localStream, 'remoteStream': remoteStream});
    }
  };
  
  console.log("Setting options.. ");
  var options = {
    'eventHandlers': eventHandlers,
    'mediaConstraints': {'audio': true, 'video': false}
  };

  console.log("Calling to " + voiceBridge + "....");
  bbbAudioConference.call('sip:' + voiceBridge + '@' + server, options); 
}

// http://stackoverflow.com/questions/5916900/detect-version-of-browser
navigator.sayswho= (function(){
    var ua= navigator.userAgent, 
        N= navigator.appName, 
        tem, 
        M= ua.match(/(opera|chrome|safari|firefox|msie|trident)\/?\s*([\d\.]+)/i) || [];
    M= M[2]? [M[1], M[2]]:[N, navigator.appVersion, '-?'];
    if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
    return M;
})();

 package org.bigbluebutton.modules.phone.managers
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.external.ExternalInterface;
  import flash.media.Sound;
  import flash.media.SoundChannel;
  import flash.media.SoundTransform;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.as3commons.logging.util.jsonXify;
  import org.bigbluebutton.common.Media;
  import org.bigbluebutton.core.Options;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.events.VoiceConfEvent;
  import org.bigbluebutton.modules.phone.events.FlashCallConnectedEvent;
  import org.bigbluebutton.modules.phone.events.FlashCallDisconnectedEvent;
  import org.bigbluebutton.modules.phone.events.FlashEchoTestFailedEvent;
  import org.bigbluebutton.modules.phone.events.FlashEchoTestHasAudioEvent;
  import org.bigbluebutton.modules.phone.events.FlashEchoTestNoAudioEvent;
  import org.bigbluebutton.modules.phone.events.FlashEchoTestStartedEvent;
  import org.bigbluebutton.modules.phone.events.FlashEchoTestStoppedEvent;
  import org.bigbluebutton.modules.phone.events.FlashErrorEvent;
  import org.bigbluebutton.modules.phone.events.FlashJoinedListenOnlyVoiceConferenceEvent;
  import org.bigbluebutton.modules.phone.events.FlashJoinedVoiceConferenceEvent;
  import org.bigbluebutton.modules.phone.events.FlashLeftVoiceConferenceEvent;
  import org.bigbluebutton.modules.phone.events.FlashMicSettingsEvent;
  import org.bigbluebutton.modules.phone.events.FlashStartEchoTestCommand;
  import org.bigbluebutton.modules.phone.events.FlashStopEchoTestCommand;
  import org.bigbluebutton.modules.phone.events.FlashVoiceConnectionStatusEvent;
  import org.bigbluebutton.modules.phone.events.JoinVoiceConferenceCommand;
  import org.bigbluebutton.modules.phone.events.LeaveVoiceConferenceCommand;
  import org.bigbluebutton.modules.phone.models.PhoneOptions;

  public class FlashCallManager
  {
	private static const LOGGER:ILogger = getClassLogger(FlashCallManager);
    
    private static const INITED:String = "INITED";
    private static const DO_ECHO_TEST:String = "DO_ECHO_TEST";
    private static const CALLING_INTO_ECHO_TEST:String = "CALLING_INTO_ECHO_TEST";
    private static const IN_ECHO_TEST:String = "IN_ECHO_TEST";
    private static const JOIN_VOICE_CONFERENCE:String = "JOIN_VOICE_CONFERENCE";
    private static const CALLING_INTO_CONFERENCE:String = "CALLING_INTO_CONFERENCE";
    private static const IN_CONFERENCE:String = "IN_CONFERENCE";
    private static const STOP_ECHO_THEN_JOIN_CONF:String = "STOP_ECHO_THEN_JOIN_CONF";

    private static const CALL_TO_LISTEN_ONLY_STREAM:String = "CALL_TO_LISTEN_ONLY_STREAM";
    private static const CONNECTING_TO_LISTEN_ONLY_STREAM:String = "CONNECTING_TO_LISTEN_ONLY_STREAM";
    private static const ON_LISTEN_ONLY_STREAM:String = "ON_LISTEN_ONLY_STREAM";

    private var _state:String = INITED;
    
    private var options:PhoneOptions;
    private var echoTestDone:Boolean = false;
    private var doingEchoTest:Boolean = false;
    private var micNames:Array = new Array();
    private var dispatcher:Dispatcher = new Dispatcher();
    private var connectionManager:ConnectionManager;
    private var streamManager:StreamManager;
    
    private var useMicIndex:int = -1;
    private var useMicName:String = "unknown";
    
    private var usingFlash:Boolean = false;
    
    [Embed(source="../sounds/LeftCall.mp3")] 
    private var noticeSoundClass:Class;
    private var noticeSound:Sound = new noticeSoundClass() as Sound;
    
    public function FlashCallManager() {
      micNames = Media.getMicrophoneNames();
      connectionManager = new ConnectionManager();
      streamManager = new StreamManager(connectionManager);
      initConnectionManager();
    }
        
    private function initConnectionManager():void {
      options = Options.getOptions(PhoneOptions) as PhoneOptions;
      var uid:String = String(Math.floor(new Date().getTime()));
      var uname:String = encodeURIComponent(UsersUtil.getMyUserID() + "-bbbID-" + UsersUtil.getMyUsername()); 
      connectionManager.setup(uid, UsersUtil.getMyUserID(), uname , UsersUtil.getInternalMeetingID(), options.uri);
    }
    
    private function get state():String {
      return _state;
    }
    
    private function set state(s:String):void {
      if (_state == IN_CONFERENCE && _state != s) { // when state changes from IN_CONFERENCE play sound
        var tSC:SoundChannel = noticeSound.play(0, 0, new SoundTransform(0.25));
      }
      _state = s;
    }
    
    private function isWebRTCSupported():Boolean {
      return (ExternalInterface.available && ExternalInterface.call("isWebRTCAvailable"));
    }

    private function isConnected():Boolean {
      return connectionManager.isConnected();
    }
    
    private function connect():void {
        connectionManager.connect();
    }
        
    private function doEchoTest():void {
      dispatcher.dispatchEvent(new FlashMicSettingsEvent(micNames));
    }
        
    private function startCall(mic:Boolean):void {
      /**
      * For echo test even if user has done echo test. This way, user is able to change mics
      * after. (richard mar 28, 2014)
      */
      if (mic) {
        if (options.skipCheck && PhoneOptions.firstAudioJoin) {
          LOGGER.debug("Calling into voice conference. skipCheck=[{0}] echoTestDone=[{1}]", [options.skipCheck, echoTestDone]);

          streamManager.useDefaultMic();
          callIntoVoiceConference();
        } else {
          LOGGER.debug("Performing echo test. echoTestDone=[{0}]", [echoTestDone]);
          doEchoTest();
        }
      } else {
        LOGGER.debug("Flash connecting to listen only voice conference");
        joinListenOnlyCall();
      }
    }
       
    private function joinListenOnlyCall():void {
      if (options.listenOnlyMode) {
        LOGGER.debug("Joining listen only call");
        callToListenOnlyStream();
      }
    }

    private function leaveListenOnlyCall():void {
      if (state == ON_LISTEN_ONLY_STREAM) {
        LOGGER.debug("Leaving listen only call");
        hangup();
      }
    }

    private function callToListenOnlyStream():void {
      if (isConnected()) {
        var destination:String = UsersUtil.getVoiceBridge();
        
        if (destination != null && destination != "") {
          LOGGER.debug("Connecting to listen only stream =[{0}]", [destination]);
          state = CONNECTING_TO_LISTEN_ONLY_STREAM;
          connectionManager.doCall(destination, true);
        } else {
          LOGGER.debug("Invalid voice conference [" + destination + "]");
          dispatcher.dispatchEvent(new FlashErrorEvent(FlashErrorEvent.INVALID_VOICE_DESTINATION));
        }
      } else {
        LOGGER.debug("Need to connect before we can join the voice conference.");
        state = CALL_TO_LISTEN_ONLY_STREAM;
        connect();
      }
    }

    private function callIntoVoiceConference():void {
      if (isConnected()) {
        var destination:String = UsersUtil.getVoiceBridge();
        
        if (destination != null && destination != "") {
          LOGGER.debug("Calling into voice conference =[{0}]", [destination]);
          state = CALLING_INTO_CONFERENCE;
          connectionManager.doCall(destination);             
        } else {
          LOGGER.debug("Invalid voice conference [{0}]", [destination]);
          dispatcher.dispatchEvent(new FlashErrorEvent(FlashErrorEvent.INVALID_VOICE_DESTINATION));
        }
      } else {
        LOGGER.debug("Need to connect before we can join the voice conference.");
        state = JOIN_VOICE_CONFERENCE;
        connect();
      }
    }
        
    private function callIntoEchoTest():void {
      if (isConnected()) {
        var destination:String = options.echoTestApp;
        if (destination != null && destination != "") {
          LOGGER.debug("Calling into echo test =[{0}]", [destination]);
          state = CALLING_INTO_ECHO_TEST;
          connectionManager.doCall(destination);
        } else {
          LOGGER.debug("Invalid echo test destination [{0}]", [destination]);
          dispatcher.dispatchEvent(new FlashErrorEvent(FlashErrorEvent.INVALID_ECHO_TEST_DESTINATION));
        }
      } else {
        LOGGER.debug("Need to connect before we can call into echo test.");
        state = DO_ECHO_TEST;
        connect();
      }
    }
    
    private function printMics():void {
      for (var i:int = 0; i < micNames.length; i++) {
        LOGGER.debug("*** MIC [{0}] = [{1}]", [i, micNames[i]]);
      }
    }
    
    public function userRequestedHangup():void {
      LOGGER.debug("userRequestedHangup, current state: {0}", [state]);
      if (usingFlash || state == ON_LISTEN_ONLY_STREAM) {
        streamManager.stopStreams();
        connectionManager.disconnect(true);        
      }
    }
    
    public function initialize():void {      
      switch (state) {
        case STOP_ECHO_THEN_JOIN_CONF:
          // if we initialize usingFlash here, we won't be able to hang up from
          // the flash connection
          LOGGER.debug("Invalid state for initialize, aborting...");
          return;
        default:
          break;
      }

      printMics();
      if (options.useWebRTCIfAvailable && isWebRTCSupported()) {
        usingFlash = false;
      } else {
        usingFlash = true;
      }
    }
    
    private function hangup():void {
      LOGGER.debug("hangup, current state: {0}", [state]);
      streamManager.stopStreams();
      connectionManager.doHangUp();
    }
    
    private function hangupEchoThenJoinVoiceConference():void {
      LOGGER.debug("hangup EchoThenJoinVoiceConference, current state: {0}", [state]);
      state = STOP_ECHO_THEN_JOIN_CONF;
      hangup();
    }
    
    public function handleFlashStartEchoTestCommand(event:FlashStartEchoTestCommand):void {
      LOGGER.debug("handling FlashStartEchoTestCommand. mic index=[{0}] name=[{1}]", [event.micIndex, event.micName]);
      useMicIndex = event.micIndex;
      useMicName = event.micName;
      LOGGER.debug("Setting up preferred micriphone.");
      streamManager.usePreferredMic(event.micIndex, event.micName);
      callIntoEchoTest();
    }
    
    public function handleFlashStopEchoTestCommand(event:FlashStopEchoTestCommand):void {
      LOGGER.debug("handling FlashStopEchoTestCommand, current state: {0}", [state]);
      if (state == IN_ECHO_TEST) {
         hangup();
      }
      else if (state == CALLING_INTO_ECHO_TEST)
      {
         state = INITED;
         hangup();
      }
    }
    
    public function handleFlashEchoTestHasAudioEvent(event:FlashEchoTestHasAudioEvent):void {
      LOGGER.debug("handling handleFlashEchoTestHasAudioEvent, current state: {0}", [state]);
      if (state == IN_ECHO_TEST) {
        hangupEchoThenJoinVoiceConference();
      } else {
        callIntoVoiceConference();
      }
      echoTestDone = true;      
    }
    
    public function handleFlashEchoTestNoAudioEvent(event:FlashEchoTestNoAudioEvent):void {
      LOGGER.debug("handling FlashEchoTestNoAudioEvent, current state: {0}", [state]);
      if (state == IN_ECHO_TEST) {
        hangup();
      }
      echoTestDone = false;      
    }
    
    public function handleFlashCallConnectedEvent(event:FlashCallConnectedEvent):void {      
      LOGGER.debug("handling FlashCallConnectedEvent, current state: {0}", [state]);
      var logData:Object = UsersUtil.initLogData();
      logData.tags = ["voice", "flash"];
      
      switch (state) {
        case CALLING_INTO_CONFERENCE:
		  		logData.logCode = "flash_joined_voice_conf_success";
          LOGGER.info(JSON.stringify(logData));
          state = IN_CONFERENCE;
          dispatcher.dispatchEvent(new FlashJoinedVoiceConferenceEvent());
          streamManager.callConnected(event.playStreamName, event.publishStreamName, event.codec, event.listenOnlyCall);
          break;
        case CONNECTING_TO_LISTEN_ONLY_STREAM:
		  		logData.logCode = "flash_joined_listen_only";
          LOGGER.info(JSON.stringify(logData));
          state = ON_LISTEN_ONLY_STREAM;
          dispatcher.dispatchEvent(new FlashJoinedListenOnlyVoiceConferenceEvent());
          streamManager.callConnected(event.playStreamName, event.publishStreamName, event.codec, event.listenOnlyCall);
          break;
        case CALLING_INTO_ECHO_TEST:
          state = IN_ECHO_TEST;
		  		logData.logCode = "flash_echo_test_success";
		  		logData.publishStreamName = event.publishStreamName;
		  		logData.playStreamName = event.playStreamName;
		  		logData.codec = event.codec;
		  		LOGGER.info(JSON.stringify(logData));
		  
          streamManager.callConnected(event.playStreamName, event.publishStreamName, event.codec, event.listenOnlyCall);
          
          dispatcher.dispatchEvent(new FlashEchoTestStartedEvent());
          break;
        default:
          LOGGER.debug("unhandled state: {0}", [state]);
          break;
      }      
    }

    public function handleFlashCallDisconnectedEvent(event:FlashCallDisconnectedEvent):void {
      var logData:Object = UsersUtil.initLogData();
      logData.tags = ["voice", "flash"];
      
      LOGGER.debug("Flash call disconnected, current state: {0}", [state]);
      switch (state) {
        case IN_CONFERENCE:
          state = INITED;
          dispatcher.dispatchEvent(new FlashLeftVoiceConferenceEvent());
          break;
        case ON_LISTEN_ONLY_STREAM:
          state = INITED;
		  		logData.logCode = "flash_left_listen_only";
          LOGGER.info(JSON.stringify(logData));
		  		dispatcher.dispatchEvent(new FlashLeftVoiceConferenceEvent());
          break;
        case IN_ECHO_TEST:
          state = INITED;
		  		logData.logCode = "flash_echo_test_stopped";
		  		LOGGER.info(JSON.stringify(logData));

          dispatcher.dispatchEvent(new FlashEchoTestStoppedEvent());
          break;
        case STOP_ECHO_THEN_JOIN_CONF:
          LOGGER.debug("Flash echo test stopped, now joining the voice conference.");
          callIntoVoiceConference();
          break;
        case CALLING_INTO_ECHO_TEST:
          state = INITED;
		  		logData.logCode = "flash_failed_calling_echo_test";
		  		LOGGER.info(JSON.stringify(logData));
          dispatcher.dispatchEvent(new FlashEchoTestFailedEvent());
          break;
        default:
          LOGGER.debug("unhandled state: " + state);
          break;
      }
    }
    
    public function handleJoinVoiceConferenceCommand(event:JoinVoiceConferenceCommand):void {
      LOGGER.debug("Handling JoinVoiceConferenceCommand.");
      switch(state) {
        case INITED:
          if (usingFlash || !event.mic) {
            startCall(event.mic);
          } else {
            LOGGER.debug("ignoring join voice conf as usingFlash=[{0}] or eventMic=[{1}]", [usingFlash, !event.mic]);
          }
          break;
        case ON_LISTEN_ONLY_STREAM:
          hangup();
          break;
        default:
          LOGGER.debug("Ignoring join voice as state=[{0}]", [state]);
      }
    }
    
    public function handleLeaveVoiceConferenceCommand(event:LeaveVoiceConferenceCommand):void {
      LOGGER.debug("Handling LeaveVoiceConferenceCommand, current state: {0}, using flash: {1}", [state, usingFlash]);
      if (!usingFlash && state != ON_LISTEN_ONLY_STREAM) {
        // this is the case when the user was connected to webrtc and then leaves the conference
        return;
      }
      hangup();
    }

    public function handleFlashVoiceConnected():void {
      switch (state) {
        case JOIN_VOICE_CONFERENCE:
          callIntoVoiceConference();
          break;
        case DO_ECHO_TEST:
          callIntoEchoTest();
          break;
        case CALL_TO_LISTEN_ONLY_STREAM:
          callToListenOnlyStream();
          break;
        case ON_LISTEN_ONLY_STREAM:
          callToListenOnlyStream();
          break;
        case IN_CONFERENCE:
		  LOGGER.debug("Reconnected while transmiting mic. Automatic retransmission not implemented.");
          state = INITED;
          break;

        default:
          LOGGER.debug("unhandled state: {0}", [state]);
          break;
      }
    }

    public function handleFlashVoiceConnectionStatusEvent(event:FlashVoiceConnectionStatusEvent):void {
      LOGGER.debug("Connection status event. status=[{0}]", [event.status]);
      switch (event.status) {
        case FlashVoiceConnectionStatusEvent.CONNECTED:
          handleFlashVoiceConnected();
          break;

        case FlashVoiceConnectionStatusEvent.FAILED:
        case FlashVoiceConnectionStatusEvent.DISCONNECTED:
          // If reconnection is under way the state should de kept
          if(!event.reconnecting) {
            state = INITED;
          }
          dispatcher.dispatchEvent(new FlashLeftVoiceConferenceEvent());
          break;

        default:
          LOGGER.debug("unhandled state: {0}", [state]);
      }
    }
    
    public function handleUseFlashModeCommand():void {
      usingFlash = true;
      startCall(true);
    }

    public function handleFlashLeftVoiceConference():void {
      if (isConnected()) {
        streamManager.stopStreams();
        connectionManager.disconnect(true);
      }
    }

    public function handleReconnectSIPSucceededEvent():void {
      if (state != ON_LISTEN_ONLY_STREAM) {
        var e:VoiceConfEvent = new VoiceConfEvent(VoiceConfEvent.EJECT_USER);
        e.userid = UsersUtil.getMyUserID();
        dispatcher.dispatchEvent(e);
      }
    }
  }
}

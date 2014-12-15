 package org.bigbluebutton.modules.phone.managers
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.external.ExternalInterface;
  import flash.media.Microphone;
  
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.model.MeetingModel;
  import org.bigbluebutton.main.api.JSLog;
  import org.bigbluebutton.modules.phone.PhoneOptions;
  import org.bigbluebutton.modules.phone.events.FlashCallConnectedEvent;
  import org.bigbluebutton.modules.phone.events.FlashCallDisconnectedEvent;
  import org.bigbluebutton.modules.phone.events.FlashEchoTestFailedEvent;
  import org.bigbluebutton.modules.phone.events.FlashEchoTestHasAudioEvent;
  import org.bigbluebutton.modules.phone.events.FlashEchoTestNoAudioEvent;
  import org.bigbluebutton.modules.phone.events.FlashEchoTestStartedEvent;
  import org.bigbluebutton.modules.phone.events.FlashEchoTestStoppedEvent;
  import org.bigbluebutton.modules.phone.events.FlashErrorEvent;
  import org.bigbluebutton.modules.phone.events.FlashJoinVoiceConferenceCommand;
  import org.bigbluebutton.modules.phone.events.FlashJoinedListenOnlyVoiceConferenceEvent;
  import org.bigbluebutton.modules.phone.events.FlashJoinedVoiceConferenceEvent;
  import org.bigbluebutton.modules.phone.events.FlashLeaveVoiceConferenceCommand;
  import org.bigbluebutton.modules.phone.events.FlashLeftVoiceConferenceEvent;
  import org.bigbluebutton.modules.phone.events.FlashMicSettingsEvent;
  import org.bigbluebutton.modules.phone.events.FlashStartEchoTestCommand;
  import org.bigbluebutton.modules.phone.events.FlashStopEchoTestCommand;
  import org.bigbluebutton.modules.phone.events.FlashVoiceConnectionStatusEvent;
  import org.bigbluebutton.modules.phone.events.JoinVoiceConferenceCommand;
  import org.bigbluebutton.modules.phone.events.LeaveVoiceConferenceCommand;

  public class FlashCallManager
  {
    private static const LOG:String = "Phone::FlashCallManager - ";   
    
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

    private var state:String = INITED;
    
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
    
    public function FlashCallManager() {
      micNames = Microphone.names;
      connectionManager = new ConnectionManager();
      streamManager = new StreamManager(connectionManager);
      initConnectionManager();
    }
        
    private function initConnectionManager():void {
      var options:PhoneOptions = new PhoneOptions();
      var uid:String = String(Math.floor(new Date().getTime()));
      var uname:String = encodeURIComponent(UsersUtil.getMyExternalUserID() + "-bbbID-" + UsersUtil.getMyUsername()); 
      connectionManager.setup(uid, UsersUtil.getMyUserID(), uname , UsersUtil.getInternalMeetingID(), options.uri);
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
        if (options.skipCheck) {
          JSLog.debug(LOG + "Calling into voice conference. skipCheck=[" + options.skipCheck + "] echoTestDone=[" + echoTestDone + "]");
          trace(LOG + "Calling into voice conference. skipCheck=[" + options.skipCheck + "] echoTestDone=[" + echoTestDone + "]");

          streamManager.useDefaultMic();
          callIntoVoiceConference();
        } else {
          JSLog.debug(LOG + "Performing echo test. echoTestDone=[" + echoTestDone + "]");
          trace(LOG + "Performing echo test. echoTestDone=[" + echoTestDone + "]");
          doEchoTest();
        }
      } else {
        JSLog.debug(LOG + "Flash connecting to listen only voice conference");
        trace(LOG + "Flash connecting to listen only voice conference");
        joinListenOnlyCall();
      }
    }
       
    private function joinListenOnlyCall():void {
      if (options.listenOnlyMode) {
        JSLog.debug(LOG + "Joining listen only call");
        trace(LOG + "Joining listen only call");
        callToListenOnlyStream();
      }
    }

    private function leaveListenOnlyCall():void {
      if (state == ON_LISTEN_ONLY_STREAM) {
        JSLog.debug(LOG + "Leaving listen only call");
        trace(LOG + "Leaving listen only call");
        hangup();
      }
    }

    private function callToListenOnlyStream():void {
      if (isConnected()) {
        var destination:String = UsersUtil.getVoiceBridge();
        
        if (destination != null && destination != "") {
          JSLog.debug(LOG + "Connecting to listen only stream =[" + destination + "]");
          trace(LOG + "Connecting to listen only stream =[" + destination + "]");
          state = CONNECTING_TO_LISTEN_ONLY_STREAM;
          connectionManager.doCall(destination, true);
        } else {
          JSLog.debug(LOG + "Invalid voice conference [" + destination + "]");
          trace(LOG + "Invalid voice conference [" + destination + "]");
          dispatcher.dispatchEvent(new FlashErrorEvent(FlashErrorEvent.INVALID_VOICE_DESTINATION));
        }
      } else {
        JSLog.debug(LOG + "Need to connect before we can join the voice conference.");
        trace(LOG + "Need to connect before we can join the voice conference.");
        state = CALL_TO_LISTEN_ONLY_STREAM;
        connect();
      }
    }

    private function callIntoVoiceConference():void {
      if (isConnected()) {
        var destination:String = UsersUtil.getVoiceBridge();
        
        if (destination != null && destination != "") {
          JSLog.debug(LOG + "Calling into voice conference =[" + destination + "]");
          trace(LOG + "Calling into voice conference =[" + destination + "]");
          state = CALLING_INTO_CONFERENCE;
          connectionManager.doCall(destination);             
        } else {
          JSLog.debug(LOG + "Invalid voice conference [" + destination + "]");
          trace(LOG + "Invalid voice conference [" + destination + "]");
          dispatcher.dispatchEvent(new FlashErrorEvent(FlashErrorEvent.INVALID_VOICE_DESTINATION));
        }
      } else {
        JSLog.debug(LOG + "Need to connect before we can join the voice conference.");
        trace(LOG + "Need to connect before we can join the voice conference.");
        state = JOIN_VOICE_CONFERENCE;
        connect();
      }
    }
        
    private function callIntoEchoTest():void {
      if (isConnected()) {
        var destination:String = options.echoTestApp;
        if (destination != null && destination != "") {
          JSLog.debug(LOG + "Calling into echo test =[" + destination + "]");
          trace(LOG + "Calling into echo test =[" + destination + "]");
          state = CALLING_INTO_ECHO_TEST;
          connectionManager.doCall(destination);
        } else {
          JSLog.debug(LOG + "Invalid echo test destination [" + destination + "]");
          trace(LOG + "Invalid echo test destination [" + destination + "]");
          dispatcher.dispatchEvent(new FlashErrorEvent(FlashErrorEvent.INVALID_ECHO_TEST_DESTINATION));
        }
      } else {
        JSLog.debug(LOG + "Need to connect before we can call into echo test.");
        trace(LOG + "Need to connect before we can call into echo test.");
        state = DO_ECHO_TEST;
        connect();
      }
    }
    
    private function printMics():void {
      for (var i:int = 0; i < micNames.length; i++) {
        JSLog.debug(LOG + "*** MIC [" + i + "] = [" + micNames[i] + "]");
        trace(LOG + "*** MIC [" + i + "] = [" + micNames[i] + "]");
      }
    }
    
    public function userRequestedHangup():void {
      JSLog.debug(LOG + "userRequestedHangup, current state: " + state);
      trace(LOG + "userRequestedHangup, current state: " + state);
      if (usingFlash || state == ON_LISTEN_ONLY_STREAM) {
        streamManager.stopStreams();
        connectionManager.disconnect(true);        
      }
    }
    
    public function initialize():void {      
      printMics();
      options = new PhoneOptions();
      if (options.useWebRTCIfAvailable && isWebRTCSupported()) {
        usingFlash = false;
      } else {
        usingFlash = true;
      }
    }
    
    private function hangup():void {
      JSLog.debug(LOG + "hangup, current state: " + state);
      trace(LOG + "hangup, current state: " + state);
      streamManager.stopStreams();
      connectionManager.doHangUp();
    }
    
    private function hangupEchoThenJoinVoiceConference():void {
      JSLog.debug(LOG + "hangup EchoThenJoinVoiceConference, current state: " + state);
      trace(LOG + "hangup EchoThenJoinVoiceConference, current state: " + state);
      state = STOP_ECHO_THEN_JOIN_CONF;
      hangup();
    }
    
    public function handleFlashStartEchoTestCommand(event:FlashStartEchoTestCommand):void {
      JSLog.debug(LOG + "handling FlashStartEchoTestCommand. mic index=[" + event.micIndex + "] name=[" + event.micName + "]");
      trace(LOG + "handling FlashStartEchoTestCommand. mic index=[" + event.micIndex + "] name=[" + event.micName + "]");
      useMicIndex = event.micIndex;
      useMicName = event.micName;
      JSLog.debug(LOG + "Setting up preferred micriphone.");
      trace(LOG + "Setting up preferred micriphone.");
      streamManager.usePreferredMic(event.micIndex, event.micName);
      callIntoEchoTest();
    }
    
    public function handleFlashStopEchoTestCommand(event:FlashStopEchoTestCommand):void {
      JSLog.debug(LOG + "handling FlashStopEchoTestCommand, current state: " + state);
      trace(LOG + "handling FlashStopEchoTestCommand, current state: " + state);
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
      JSLog.debug(LOG + "handling handleFlashEchoTestHasAudioEvent, current state: " + state);
      trace(LOG + "handling handleFlashEchoTestHasAudioEvent, current state: " + state);
      if (state == IN_ECHO_TEST) {
        hangupEchoThenJoinVoiceConference();
      } else {
        callIntoVoiceConference();
      }
      echoTestDone = true;      
    }
    
    public function handleFlashEchoTestNoAudioEvent(event:FlashEchoTestNoAudioEvent):void {
      JSLog.debug(LOG + "handling FlashEchoTestNoAudioEvent, current state: " + state);
      trace(LOG + "handling FlashEchoTestNoAudioEvent, current state: " + state);
      if (state == IN_ECHO_TEST) {
        hangup();
      }
      echoTestDone = false;      
    }
    
    public function handleFlashCallConnectedEvent(event:FlashCallConnectedEvent):void {      
      JSLog.debug(LOG + "handling FlashCallConnectedEvent, current state: " + state);
      trace(LOG + "handling FlashCallConnectedEvent, current state: " + state);
      switch (state) {
        case CALLING_INTO_CONFERENCE:
          JSLog.debug(LOG + "Successfully joined the voice conference.");
          trace(LOG + "Successfully joined the voice conference.");
          state = IN_CONFERENCE;
          dispatcher.dispatchEvent(new FlashJoinedVoiceConferenceEvent());
          streamManager.callConnected(event.playStreamName, event.publishStreamName, event.codec, event.listenOnlyCall);
          break;
        case CONNECTING_TO_LISTEN_ONLY_STREAM:
          JSLog.debug(LOG + "Successfully connected to the listen only stream.");
          trace(LOG + "Successfully connected to the listen only stream.");
          state = ON_LISTEN_ONLY_STREAM;
          dispatcher.dispatchEvent(new FlashJoinedListenOnlyVoiceConferenceEvent());
          streamManager.callConnected(event.playStreamName, event.publishStreamName, event.codec, event.listenOnlyCall);
          break;
        case CALLING_INTO_ECHO_TEST:
          state = IN_ECHO_TEST;
          trace(LOG + "Successfully called into the echo test application.  [" + event.publishStreamName + "] : [" + event.playStreamName + "] : [" + event.codec + "]");
          JSLog.debug(LOG + "Successfully called into the echo test application.  [" + event.publishStreamName + "] : [" + event.playStreamName + "] : [" + event.codec + "]");
          streamManager.callConnected(event.playStreamName, event.publishStreamName, event.codec, event.listenOnlyCall);
          
          JSLog.debug(LOG + "Successfully called into the echo test application.");
          trace(LOG + "Successfully called into the echo test application.");
          dispatcher.dispatchEvent(new FlashEchoTestStartedEvent());
          break;
        default:
          JSLog.debug(LOG + "unhandled state: " + state);
          trace(LOG + "unhandled state: " + state);
          break;
      }      
    }

    public function handleFlashCallDisconnectedEvent(event:FlashCallDisconnectedEvent):void {
      JSLog.debug(LOG + "Flash call disconnected, current state: " + state);
      trace(LOG + "Flash call disconnected, current state: " + state);
      switch (state) {
        case IN_CONFERENCE:
          state = INITED;
          dispatcher.dispatchEvent(new FlashLeftVoiceConferenceEvent());
          break;
        case ON_LISTEN_ONLY_STREAM:
          state = INITED;
          JSLog.debug(LOG + "Flash user left the listen only stream.");
          trace(LOG + "Flash user left the listen only stream.");
		      dispatcher.dispatchEvent(new FlashLeftVoiceConferenceEvent());
          break;
        case IN_ECHO_TEST:
          state = INITED;
          JSLog.debug(LOG + "Flash echo test stopped.");
          trace(LOG + "Flash echo test stopped.");
          dispatcher.dispatchEvent(new FlashEchoTestStoppedEvent());
          break;
        case STOP_ECHO_THEN_JOIN_CONF:
          JSLog.debug(LOG + "Flash echo test stopped, now joining the voice conference.");
          trace(LOG + "Flash echo test stopped, now joining the voice conference.");
          callIntoVoiceConference();
          break;
        case CALLING_INTO_ECHO_TEST:
          state = INITED;
          JSLog.debug(LOG + "Unsuccessfully called into the echo test application.");
          trace(LOG + "Unsuccessfully called into the echo test application.");
          dispatcher.dispatchEvent(new FlashEchoTestFailedEvent());
          break;
        default:
          JSLog.debug(LOG + "unhandled state: " + state);
          trace(LOG + "unhandled state: " + state);
          break;
      }
    }
    
    public function handleJoinVoiceConferenceCommand(event:JoinVoiceConferenceCommand):void {
      JSLog.debug(LOG + "Handling JoinVoiceConferenceCommand.");
      trace(LOG + "Handling JoinVoiceConferenceCommand.");
      switch(state) {
        case INITED:
          if (usingFlash || !event.mic) {
            startCall(event.mic);
          } else {
            JSLog.debug(LOG + "ignoring join voice conf as usingFlash=[" + usingFlash + "] or eventMic=[" + !event.mic + "]");
            trace(LOG + "ignoring join voice conf as usingFlash=[" + usingFlash + "] or eventMic=[" + !event.mic + "]");
          }
          break;
		
        default:
          JSLog.debug("Ignoring join voice as state=[" + state + "]");
          trace("Ignoring join voice as state=[" + state + "]");
      }
    }
    
    public function handleLeaveVoiceConferenceCommand(event:LeaveVoiceConferenceCommand):void {
      JSLog.debug(LOG + "Handling LeaveVoiceConferenceCommand, current state: " + state + ", using flash: " + usingFlash);
      trace(LOG + "Handling LeaveVoiceConferenceCommand, current state: " + state + ", using flash: " + usingFlash);
      if (!usingFlash && state != ON_LISTEN_ONLY_STREAM) {
        // this is the case when the user was connected to webrtc and then leaves the conference
        return;
      }
      hangup();
    }
    
	public function handleBecomeViewer():void {
    JSLog.debug(LOG + "Handling BecomeViewer, current state: " + state + ", using flash: " + usingFlash);
    trace(LOG + "Handling BecomeViewer, current state: " + state + ", using flash: " + usingFlash);
		if (options.presenterShareOnly) {
			if (!usingFlash || state != IN_CONFERENCE || UsersUtil.amIModerator()) return;
			
      JSLog.debug(LOG + "handleBecomeViewer leaving flash with mic and joining listen only stream");
      trace(LOG + "handleBecomeViewer leaving flash with mic and joining listen only stream");
			hangup();
			
			var command:JoinVoiceConferenceCommand = new JoinVoiceConferenceCommand();
			command.mic = false;
			dispatcher.dispatchEvent(command);
		}
	}
	
    public function handleFlashVoiceConnectionStatusEvent(event:FlashVoiceConnectionStatusEvent):void {
      JSLog.debug(LOG + "Connection status event. status=[" + event.status + "]");
      trace(LOG + "Connection status event. status=[" + event.status + "]");
      if (event.status == FlashVoiceConnectionStatusEvent.CONNECTED) {
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
          default:
            JSLog.debug(LOG + "unhandled state: " + state);
            trace(LOG + "unhandled state: " + state);
            break;
        }
      }
    }
    
    public function handleUseFlashModeCommand():void {
      usingFlash = true;
      startCall(true);
    }
  }
}
package org.bigbluebutton.modules.phone.managers
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.events.TimerEvent;
  import flash.external.ExternalInterface;
  import flash.utils.Timer;
  
  import flexlib.scheduling.timelineClasses.TimeRangeDescriptorUtil;
  
  import mx.controls.Alert;
  import mx.events.CloseEvent;
  
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.main.api.JSAPI;
  import org.bigbluebutton.modules.phone.PhoneOptions;
  import org.bigbluebutton.modules.phone.events.AudioSelectionWindowEvent;
  import org.bigbluebutton.modules.phone.events.FlashCallDisconnectedEvent;
  import org.bigbluebutton.modules.phone.events.JoinVoiceConferenceCommand;
  import org.bigbluebutton.modules.phone.events.PerformEchoTestEvent;
  import org.bigbluebutton.modules.phone.events.UseFlashModeCommand;
  import org.bigbluebutton.modules.phone.events.WebRtcAskMicPermissionEvent;
  import org.bigbluebutton.modules.phone.events.WebRtcAskMicPermissionToJoinConferenceEvent;
  import org.bigbluebutton.modules.phone.events.WebRtcAskUserToChangeMicEvent;
  import org.bigbluebutton.modules.phone.events.WebRtcCallConnectedEvent;
  import org.bigbluebutton.modules.phone.events.WebRtcCallDisconnectedEvent;
  import org.bigbluebutton.modules.phone.events.WebRtcEchoTestStartedEvent;
  import org.bigbluebutton.modules.phone.events.WebRtcRemoveAskMicPermissionEvent;
  import org.bigbluebutton.util.i18n.ResourceUtil;

  public class WebRtcCallManager
  {
    private static const LOG:String = "Phone::WebRtcCallManager - ";
    
	private static const INITED:int = 0;
	private static const DO_ECHO_TEST:int = 1;
	private static const CALLING_INTO_ECHO_TEST:int = 2;
	private static const IN_ECHO_TEST:int = 3;
	private static const JOIN_VOICE_CONFERENCE:int = 4;
	private static const CALLING_INTO_CONFERENCE:int = 5;
	private static const IN_CONFERENCE:int = 6;
	private static const STOP_ECHO_THEN_JOIN_CONF:int = 7;
	private static const ECHO_TEST_FAILED:int = 8;
	
    private var state:int = INITED;
	
    private var browserType:String = "unknown";
    private var browserVersion:int = 0;
    private var dispatcher:Dispatcher = new Dispatcher();
    private var echoTestDone:Boolean = false;
    
    private var usingWebRtc:Boolean = false;
    private var options:PhoneOptions;
    
    public function WebRtcCallManager() {
      var browserInfo:Array = JSAPI.getInstance().getBrowserInfo();
      if (browserInfo != null) {
        browserType = browserInfo[0];
        browserVersion = browserInfo[1];
      }
    }
    
    private function isWebRtcSupported():Boolean {
      return (ExternalInterface.available && ExternalInterface.call("isWebrtcCapable"));
    }
    
    public function userRequestedHangup():void {
      if (usingWebRtc) hangup();
    }
    
    public function initialize():void {         
      options = new PhoneOptions();
      if (options.useWebrtcIfAvailable && isWebRtcSupported()) {
        usingWebRtc = true;
      }
    }
    
    private function startWebRtcEchoTest():void {
	  state = CALLING_INTO_ECHO_TEST;
      ExternalInterface.call("startWebrtcAudioTest");
    }
    
    private function endEchoTest():void {
      ExternalInterface.call("stopWebrtcAudioTest");
    }
    
    private function hangup():void {
      ExternalInterface.call("stopWebrtcAudioTest");
    }
    
    private function askMicPermission():void {      
      dispatcher.dispatchEvent(new WebRtcAskMicPermissionEvent(browserType));       
    }
    
    private function hideMicPermission():void {
      dispatcher.dispatchEvent(new WebRtcRemoveAskMicPermissionEvent());
    }
    
    public function handleWebRtcEchoTestStarted():void {
	  state = DO_ECHO_TEST;
      hideMicPermission();
      dispatcher.dispatchEvent(new WebRtcEchoTestStartedEvent());
    }
    
    public function handleWebRtcEchoTestNoAudioEvent():void {
	  state = ECHO_TEST_FAILED;
      endEchoTest();
      hideMicPermission();
      
      //dispatcher.dispatchEvent(new WebRtcAskUserToChangeMicEvent(browserType));
      dispatcher.dispatchEvent(new UseFlashModeCommand());
    }
    
	private var t:Timer;
	
    public function handleWebRtcEchoTestHasAudioEvent():void {
	  state = STOP_ECHO_THEN_JOIN_CONF;
      endEchoTest();
      /**
       * Force echo test even if user has done echo test. This way, user is able to change mics
       * after. (richard mar 28, 2014)
       */
      //echoTestDone = true;
	  t = new Timer(1000, 1);
	  t.addEventListener(TimerEvent.TIMER, function(e:TimerEvent):void {
      	joinVoiceConference();
	  });
	  t.start();
    }
    
    public function handleWebRtcConfCallStartedEvent():void {
	  trace(LOG + "setting state to IN_CONFERENCE");
	  state = IN_CONFERENCE;
      hideMicPermission();
      dispatcher.dispatchEvent(new WebRtcCallConnectedEvent());
    }
    
    public function handleWebRtcConfCallEndedEvent():void {
	  state = INITED;
      hideMicPermission();
      dispatcher.dispatchEvent(new WebRtcCallDisconnectedEvent());
    }
    
    private function joinVoiceConference():void {
	  state = JOIN_VOICE_CONFERENCE;
      ExternalInterface.call("joinWebRtcVoiceConference");
      dispatcher.dispatchEvent(new WebRtcAskMicPermissionToJoinConferenceEvent(browserType, browserVersion));        
    }
    
    public function handleJoinVoiceConferenceCommand(event:JoinVoiceConferenceCommand):void {
      trace(LOG + "handleJoinVoiceConferenceCommand - usingWebRTC: " + usingWebRtc + ", event.mic: " + event.mic);
      
      if (!usingWebRtc || !event.mic) return;
      
      if (options.skipCheck || echoTestDone) {
        joinVoiceConference();
      } else {
        startWebRtcEchoTest();
        askMicPermission();
      }
    }
    
    public function handleLeaveVoiceConferenceCommand():void {
      if (!usingWebRtc) return;
      state = INITED;
      ExternalInterface.call("leaveWebRtcVoiceConference");
    }
    
	public function handleBecomeViewer():void {
		trace(LOG + "handleBecomeViewer received");
		if (options.presenterShareOnly) {
			if (!usingWebRtc || state != IN_CONFERENCE || UsersUtil.amIModerator()) return;
			
			trace(LOG + "handleBecomeViewer leaving WebRTC and joining listen only stream");
			ExternalInterface.call("leaveWebRtcVoiceConference");
			
			var command:JoinVoiceConferenceCommand = new JoinVoiceConferenceCommand();
			command.mic = false;
			dispatcher.dispatchEvent(command);
		}
	}
	
    public function handleUseFlashModeCommand():void {
      usingWebRtc = false;
      hangup();
    }

    public function handleWebrtcEchoTestFailedEvent(reason:String):void {
	  state = INITED;
      endEchoTest();
      hideMicPermission();
	  var alert:Alert = Alert.show(ResourceUtil.getInstance().getString("bbb.webrtcWarning.message", [reason]), ResourceUtil.getInstance().getString("bbb.webrtcWarning.title"), Alert.YES | Alert.NO, null, handleCallFailedUserResponse, null, Alert.YES);
    }
    
    public function handleWebrtcCallFailedEvent(reason:String):void {
      state = INITED;
      hideMicPermission();
      var alert:Alert = Alert.show(ResourceUtil.getInstance().getString("bbb.webrtcWarning.message", [reason]), ResourceUtil.getInstance().getString("bbb.webrtcWarning.title"), Alert.YES | Alert.NO, null, handleCallFailedUserResponse, null, Alert.YES);
    }
    
    private function handleCallFailedUserResponse(e:CloseEvent):void {
      if (e.detail == Alert.YES){
        dispatcher.dispatchEvent(new UseFlashModeCommand());
      } else {
        dispatcher.dispatchEvent(new AudioSelectionWindowEvent(AudioSelectionWindowEvent.CLOSED_AUDIO_SELECTION));
      }
    }
  }
}
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
  import org.bigbluebutton.modules.phone.events.WebRTCAskUserToChangeMicEvent;
  import org.bigbluebutton.modules.phone.events.WebRTCEchoTestEvent;
  import org.bigbluebutton.modules.phone.events.WebRTCMediaEvent;
  import org.bigbluebutton.util.i18n.ResourceUtil;

  public class WebRTCCallManager
  {
    private static const LOG:String = "Phone::WebRTCCallManager - ";
    
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
    
    private var usingWebRTC:Boolean = false;
    private var options:PhoneOptions;
    
    public function WebRTCCallManager() {
      var browserInfo:Array = JSAPI.getInstance().getBrowserInfo();
      if (browserInfo != null) {
        browserType = browserInfo[0];
        browserVersion = browserInfo[1];
      }
    }
    
    private function isWebRTCSupported():Boolean {
      return (ExternalInterface.available && ExternalInterface.call("isWebRTCAvailable"));
    }
    
    public function userRequestedHangup():void {
      if (usingWebRTC) hangup();
    }
    
    public function initialize():void {         
      options = new PhoneOptions();
      if (options.useWebRTCIfAvailable && isWebRTCSupported()) {
        usingWebRTC = true;
      }
    }
    
    private function startWebRTCEchoTest():void {
	  state = CALLING_INTO_ECHO_TEST;
      ExternalInterface.call("startWebRTCAudioTest");
    }
    
    private function endEchoTest():void {
      ExternalInterface.call("stopWebRTCAudioTest");
    }
	
	private function endEchoTestJoinConference():void {
		ExternalInterface.call("stopWebRTCAudioTestJoinConference");
	}
    
    private function hangup():void {
      ExternalInterface.call("stopWebRTCAudioTest");
    }
    
    private function hideMicPermission():void {
      dispatcher.dispatchEvent(new WebRTCMediaEvent(WebRTCMediaEvent.WEBRTC_MEDIA_FAIL));
    }
    
    public function handleWebRTCEchoTestStartedEvent():void {
	  state = DO_ECHO_TEST;
    }
    
    public function handleWebRTCEchoTestNoAudioEvent():void {
      trace(LOG + "handleWebRTCEchoTestNoAudioEvent");
	  state = ECHO_TEST_FAILED;
      endEchoTest();
      
      //dispatcher.dispatchEvent(new WebRTCAskUserToChangeMicEvent(browserType));
      dispatcher.dispatchEvent(new UseFlashModeCommand());
    }
    
	private var t:Timer;
	
    public function handleWebRTCEchoTestHasAudioEvent():void {
      trace(LOG + "handleWebRTCEchoTestHasAudioEvent");
	  state = STOP_ECHO_THEN_JOIN_CONF;
	  endEchoTestJoinConference();
    }
    
    public function handleWebRTCCallStartedEvent():void {
	  trace(LOG + "setting state to IN_CONFERENCE");
	  state = IN_CONFERENCE;
    }
    
    public function handleWebRTCCallEndedEvent():void {
	  state = INITED;
      hideMicPermission();
    }
    
    private function joinVoiceConference():void {
	  state = JOIN_VOICE_CONFERENCE;
      ExternalInterface.call("joinWebRTCVoiceConference");      
    }
    
    public function handleJoinVoiceConferenceCommand(event:JoinVoiceConferenceCommand):void {
      trace(LOG + "handleJoinVoiceConferenceCommand - usingWebRTC: " + usingWebRTC + ", event.mic: " + event.mic);
      
      if (!usingWebRTC || !event.mic) return;
      
      if (options.skipCheck || echoTestDone) {
        joinVoiceConference();
      } else {
        startWebRTCEchoTest();
      }
    }
    
    public function handleLeaveVoiceConferenceCommand():void {
      if (!usingWebRTC) return;
      state = INITED;
      ExternalInterface.call("leaveWebRTCVoiceConference");
    }
    
	public function handleBecomeViewer():void {
		trace(LOG + "handleBecomeViewer received");
		if (options.presenterShareOnly) {
			if (!usingWebRTC || state != IN_CONFERENCE || UsersUtil.amIModerator()) return;
			
			trace(LOG + "handleBecomeViewer leaving WebRTC and joining listen only stream");
			ExternalInterface.call("leaveWebRTCVoiceConference");
			
			var command:JoinVoiceConferenceCommand = new JoinVoiceConferenceCommand();
			command.mic = false;
			dispatcher.dispatchEvent(command);
		}
	}
	
    public function handleUseFlashModeCommand():void {
      usingWebRTC = false;
      hangup();
    }

    public function handleWebRTCEchoTestFailedEvent(reason:String):void {
	  state = INITED;
      endEchoTest();
      hideMicPermission();
	  var alert:Alert = Alert.show(ResourceUtil.getInstance().getString("bbb.webrtcWarning.message", [reason]), ResourceUtil.getInstance().getString("bbb.webrtcWarning.title"), Alert.YES | Alert.NO, null, handleCallFailedUserResponse, null, Alert.YES);
    }
    
    public function handleWebRTCCallFailedEvent(reason:String):void {
      state = INITED;
      hideMicPermission();
      var alert:Alert = Alert.show(ResourceUtil.getInstance().getString("bbb.webrtcWarning.message", [reason]), ResourceUtil.getInstance().getString("bbb.webrtcWarning.title"), Alert.YES | Alert.NO, null, handleCallFailedUserResponse, null, Alert.YES);
    }
    
    public function handleWebRTCMediaFailedEvent():void {
      state = INITED;
      var alert:Alert = Alert.show(ResourceUtil.getInstance().getString("bbb.webrtcWarning.mediamessage"), ResourceUtil.getInstance().getString("bbb.webrtcWarning.title"), Alert.YES | Alert.NO, null, handleCallFailedUserResponse, null, Alert.YES);
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
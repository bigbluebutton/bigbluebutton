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
  import org.bigbluebutton.modules.phone.PhoneModel;
  import org.bigbluebutton.modules.phone.PhoneOptions;
  import org.bigbluebutton.modules.phone.events.AudioSelectionWindowEvent;
  import org.bigbluebutton.modules.phone.events.FlashCallDisconnectedEvent;
  import org.bigbluebutton.modules.phone.events.JoinVoiceConferenceCommand;
  import org.bigbluebutton.modules.phone.events.PerformEchoTestEvent;
  import org.bigbluebutton.modules.phone.events.UseFlashModeCommand;
  import org.bigbluebutton.modules.phone.events.WebRTCAskUserToChangeMicEvent;
  import org.bigbluebutton.modules.phone.events.WebRTCEchoTestEvent;
  import org.bigbluebutton.modules.phone.events.WebRTCEchoTestStartedEvent;
  import org.bigbluebutton.modules.phone.events.WebRTCJoinedVoiceConferenceEvent;
  import org.bigbluebutton.modules.phone.events.WebRTCMediaEvent;
  import org.bigbluebutton.modules.phone.models.Constants;
  import org.bigbluebutton.modules.phone.models.WebRTCModel;
  import org.bigbluebutton.util.i18n.ResourceUtil;

  public class WebRTCCallManager
  {
    private static const LOG:String = "Phone::WebRTCCallManager - ";
    
    private var browserType:String = "unknown";
    private var browserVersion:int = 0;
    private var dispatcher:Dispatcher = new Dispatcher();
    private var echoTestDone:Boolean = false;
    
    private var usingWebRTC:Boolean = false;
    private var options:PhoneOptions;
    
    private var model:WebRTCModel = PhoneModel.getInstance().webRTCModel;
    
    public function WebRTCCallManager() {
      var browserInfo:Array = JSAPI.getInstance().getBrowserInfo();
      if (browserInfo != null) {
        browserType = browserInfo[0];
        browserVersion = browserInfo[1];
      }
	  options = new PhoneOptions();
    }
    
    private function isWebRTCSupported():Boolean {
      trace(LOG + "- isWebRTCSupported - ExternalInterface.available=[" + ExternalInterface.available 
        + "], isWebRTCAvailable=[" + ExternalInterface.call("isWebRTCAvailable") + "]");
      return (ExternalInterface.available && ExternalInterface.call("isWebRTCAvailable"));
    }
    
    public function userRequestedHangup():void {
      if (usingWebRTC) hangup();
    }
    
    public function initialize():void {         

    }
    
    
    private function checkIfToUseWebRTC():Boolean {
      var webRTCSupported:Boolean = isWebRTCSupported();
      
      trace(LOG + "- checkIfToUseWebRTC - useWebRTCIfAvailable=[" + options.useWebRTCIfAvailable 
        + "], isWebRTCSupported=[" + webRTCSupported + "]");
      if (options.useWebRTCIfAvailable && webRTCSupported) {
        return true;
      }      
      return false;
    }
    
    private function startWebRTCEchoTest():void {
	    model.state = Constants.CALLING_INTO_ECHO_TEST;
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
    
    public function handleWebRTCEchoTestStartedEvent():void {
      model.state = Constants.DO_ECHO_TEST;
      dispatcher.dispatchEvent(new WebRTCEchoTestStartedEvent());
    }
    
    public function handleWebRTCEchoTestNoAudioEvent():void {
      trace(LOG + "handleWebRTCEchoTestNoAudioEvent");
      model.state = Constants.ECHO_TEST_FAILED;
      endEchoTest();
      
      dispatcher.dispatchEvent(new UseFlashModeCommand());
    }
    
	  private var t:Timer;
	
    public function handleWebRTCEchoTestHasAudioEvent():void {
      trace(LOG + "handleWebRTCEchoTestHasAudioEvent");
      model.state = Constants.STOP_ECHO_THEN_JOIN_CONF;
	    endEchoTestJoinConference();
    }
    
    public function handleWebRTCCallStartedEvent():void {
	    trace(LOG + "setting state to IN_CONFERENCE");
      model.state = Constants.IN_CONFERENCE;
      dispatcher.dispatchEvent(new WebRTCJoinedVoiceConferenceEvent());
      
    }
    
    public function handleWebRTCCallEndedEvent():void {
      model.state = Constants.INITED;
      
      
    }
    
    private function joinVoiceConference():void {
      model.state = Constants.JOIN_VOICE_CONFERENCE;
      ExternalInterface.call("joinWebRTCVoiceConference");      
    }
    
    public function handleJoinVoiceConferenceCommand(event:JoinVoiceConferenceCommand):void {
      trace(LOG + "handleJoinVoiceConferenceCommand - usingWebRTC: " + usingWebRTC + ", event.mic: " + event.mic);
      
      usingWebRTC = checkIfToUseWebRTC();
      
      if (!usingWebRTC || !event.mic) return;
      
      if (options.skipCheck || echoTestDone) {
        joinVoiceConference();
      } else {
        startWebRTCEchoTest();
      }
    }
    
    public function handleLeaveVoiceConferenceCommand():void {
      if (!usingWebRTC) return;
      model.state = Constants.INITED;
      ExternalInterface.call("leaveWebRTCVoiceConference");
    }
    
	  public function handleBecomeViewer():void {
		  trace(LOG + "handleBecomeViewer received");
		  if (options.presenterShareOnly) {
			  if (!usingWebRTC || model.state != Constants.IN_CONFERENCE || UsersUtil.amIModerator()) return;
			
			  trace(LOG + "handleBecomeViewer leaving WebRTC and joining listen only stream");
			  ExternalInterface.call("leaveWebRTCVoiceConference");
			
			  var command:JoinVoiceConferenceCommand = new JoinVoiceConferenceCommand();
			  command.mic = false;
			  dispatcher.dispatchEvent(command);
		  }
	  }
	
    public function handleUseFlashModeCommand():void {
      usingWebRTC = false;
    }

    public function handleWebRTCEchoTestFailedEvent(errorCode:Number):void {
      model.state = Constants.INITED;
      endEchoTest();
	  var errorString:String = ResourceUtil.getInstance().getString("bbb.webrtcWarning.failedError." + errorCode);
	  if (!errorString) {
		  errorString = ResourceUtil.getInstance().getString("bbb.webrtcWarning.failedError.unknown", [errorCode]);
	  }
	  
	  var alert:Alert = Alert.show(ResourceUtil.getInstance().getString("bbb.webrtcWarning.message", [errorString]), ResourceUtil.getInstance().getString("bbb.webrtcWarning.title"), Alert.YES | Alert.NO, null, handleCallFailedUserResponse, null, Alert.YES);
    }
    
    public function handleWebRTCEchoTestEndedUnexpectedly():void {
      model.state = Constants.INITED;
      var alert:Alert = Alert.show(ResourceUtil.getInstance().getString("bbb.webrtcWarning.endedunexpectedly"), ResourceUtil.getInstance().getString("bbb.webrtcWarning.title"), Alert.YES | Alert.NO, null, handleCallFailedUserResponse, null, Alert.YES);
    }
    
    public function handleWebRTCCallFailedEvent(errorCode:Number):void {
      model.state = Constants.INITED;
	  var errorString:String = ResourceUtil.getInstance().getString("bbb.webrtcWarning.failedError." + errorCode);
	  if (!errorString) {
		  errorString = ResourceUtil.getInstance().getString("bbb.webrtcWarning.failedError.unknown", [errorCode]);
	  }
      var alert:Alert = Alert.show(ResourceUtil.getInstance().getString("bbb.webrtcWarning.message", [errorString]), ResourceUtil.getInstance().getString("bbb.webrtcWarning.title"), Alert.YES | Alert.NO, null, handleCallFailedUserResponse, null, Alert.YES);
    }
    
    public function handleWebRTCMediaFailedEvent():void {
      model.state = Constants.INITED;
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
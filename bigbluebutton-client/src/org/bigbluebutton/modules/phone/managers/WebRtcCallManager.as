package org.bigbluebutton.modules.phone.managers
{
  import com.asfusion.mate.events.Dispatcher; 
  import flash.external.ExternalInterface;  
  import org.bigbluebutton.main.api.JSAPI;
  import org.bigbluebutton.modules.phone.PhoneOptions;
  import org.bigbluebutton.modules.phone.events.CallConnectedEvent;
  import org.bigbluebutton.modules.phone.events.CallDisconnectedEvent;
  import org.bigbluebutton.modules.phone.events.PerformEchoTestEvent;
  import org.bigbluebutton.modules.phone.events.WebRtcAskMicPermissionEvent;
  import org.bigbluebutton.modules.phone.events.WebRtcAskMicPermissionToJoinConferenceEvent;
  import org.bigbluebutton.modules.phone.events.WebRtcAskUserToChangeMicEvent;
  import org.bigbluebutton.modules.phone.events.WebRtcEchoTestStartedEvent;
  import org.bigbluebutton.modules.phone.events.WebRtcRemoveAskMicPermissionEvent;

  public class WebRtcCallManager
  {
    private static const LOG:String = "Phone::WebRtcCallManager - ";
    
    private var browserType:String = "unknown";
    private var dispatcher:Dispatcher = new Dispatcher();
    
    private var usingWebRtc:Boolean = false;
    private var options:PhoneOptions;
    
    public function WebRtcCallManager() {
      browserType = JSAPI.getInstance().getBrowserType();
    }
    
    private function isWebRtcSupported():Boolean {
      return (ExternalInterface.available && ExternalInterface.call("isWebrtcCapable"));
    }
    
    public function initialize():void {         
      options = new PhoneOptions();
      if (options.useWebrtcIfAvailable && isWebRtcSupported()) {
        startWebRtcEchoTest();
        askMicPermission();        
      }
    }
    
    private function startWebRtcEchoTest():void {
      ExternalInterface.call("startWebrtcAudioTest");
    }
    
    private function endEchoTest():void {
      ExternalInterface.call("stopWebrtcAudioTest");
    }
    
    private function askMicPermission():void {      
      dispatcher.dispatchEvent(new WebRtcAskMicPermissionEvent(browserType));       
    }
    
    private function hideMicPermission():void {
      dispatcher.dispatchEvent(new WebRtcRemoveAskMicPermissionEvent());
    }
    
    public function handleWebRtcEchoTestStarted():void {     
      hideMicPermission();
      dispatcher.dispatchEvent(new WebRtcEchoTestStartedEvent());
    }
    
    public function handleWebRtcEchoTestNoAudioEvent():void {
      endEchoTest();
      hideMicPermission();
      if (browserType == "Firefox") {
        startWebRtcEchoTest();
      }
      
      dispatcher.dispatchEvent(new WebRtcAskUserToChangeMicEvent(browserType));
    }
    
    public function handleWebRtcEchoTestHasAudioEvent():void {
      endEchoTest();
      ExternalInterface.call("joinWebRtcVoiceConference");
      dispatcher.dispatchEvent(new WebRtcAskMicPermissionToJoinConferenceEvent(browserType));
    }
    
    public function handleWebRtcConfCallStartedEvent():void {
      hideMicPermission();
      dispatcher.dispatchEvent(new CallConnectedEvent());
    }
    
    public function handleWebRtcConfCallEndedEvent():void {
      hideMicPermission();
      dispatcher.dispatchEvent(new CallDisconnectedEvent());
    }
    
    public function handleJoinVoiceConferenceCommand():void {
      startWebRtcEchoTest();
    }
    
    public function handleLeaveVoiceConferenceCommand():void {
      ExternalInterface.call("leaveWebRtcVoiceConference");
    }
  }
}
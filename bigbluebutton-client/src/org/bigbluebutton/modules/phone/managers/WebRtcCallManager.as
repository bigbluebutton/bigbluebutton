package org.bigbluebutton.modules.phone.managers
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.external.ExternalInterface;
  
  import org.bigbluebutton.main.api.JSAPI;
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
    private var browserType:String = "unknown";
    private var dispatcher:Dispatcher = new Dispatcher();
    private var echoTestDone:Boolean = false;
    
    public function WebRtcCallManager() {
      browserType = JSAPI.getInstance().getBrowserType();
    }
    
    
    public function initialize():void {         
      startWebRtcEchoTest();
      askMicPermission();
    }
    
    public function startWebRtcEchoTest():void {
      ExternalInterface.call("startWebrtcAudioTest");
    }
    
    private function endEchoTest():void {
      ExternalInterface.call("stopWebrtcAudioTest");
    }
    
    public function askMicPermission():void {      
      dispatcher.dispatchEvent(new WebRtcAskMicPermissionEvent(browserType));       
    }
    
    public function hideMicPermission():void {
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
      echoTestDone = true;
      joinVoiceConference();
    }
    
    public function handleWebRtcConfCallStartedEvent():void {
      hideMicPermission();
      dispatcher.dispatchEvent(new CallConnectedEvent());
    }
    
    public function handleWebRtcConfCallEndedEvent():void {
      hideMicPermission();
      dispatcher.dispatchEvent(new CallDisconnectedEvent());
    }
    
    private function joinVoiceConference():void {
      ExternalInterface.call("joinWebRtcVoiceConference");
      dispatcher.dispatchEvent(new WebRtcAskMicPermissionToJoinConferenceEvent(browserType));        
    }
    
    public function handleJoinVoiceConferenceCommand():void {
      if (echoTestDone) {
        joinVoiceConference();
      } else {
        startWebRtcEchoTest();
      }     
    }
    
    public function handleLeaveVoiceConferenceCommand():void {
      ExternalInterface.call("leaveWebRtcVoiceConference");
    }
  }
}
package org.bigbluebutton.modules.phone.managers
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.external.ExternalInterface;
  
  import org.bigbluebutton.main.api.JSAPI;
  import org.bigbluebutton.modules.phone.events.WebRtcAskMicPermissionEvent;
  import org.bigbluebutton.modules.phone.events.PerformEchoTestEvent;
  import org.bigbluebutton.modules.phone.events.WebRtcRemoveAskMicPermissionEvent;
  import org.bigbluebutton.modules.phone.events.WebRtcAskMicPermissionToJoinConferenceEvent;
  import org.bigbluebutton.modules.phone.events.WebRtcAskUserToChangeMicEvent;
  import org.bigbluebutton.modules.phone.events.WebRtcEchoTestStartedEvent;

  public class WebRtcCallManager
  {
    private var browserType:String = "unknown";
    private var dispatcher:Dispatcher = new Dispatcher();
    
    public function WebRtcCallManager()
    {
      browserType = JSAPI.getInstance().getBrowserType();
    }
    
    
    public function initialize():void {         
      ExternalInterface.call("startWebrtcAudioTest");
      askMicPermission();
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
      hideMicPermission();
      dispatcher.dispatchEvent(new WebRtcAskUserToChangeMicEvent());
    }
    
    public function handleWebRtcEchoTestHasAudioEvent():void {
      ExternalInterface.call("joinWebRTCVoiceConference");
      dispatcher.dispatchEvent(new WebRtcAskMicPermissionToJoinConferenceEvent());
    }
    
    public function leaveVoiceConference():void {
      
    }
  }
}
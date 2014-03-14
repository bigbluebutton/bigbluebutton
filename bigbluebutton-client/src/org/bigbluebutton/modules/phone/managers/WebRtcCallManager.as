package org.bigbluebutton.modules.phone.managers
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.external.ExternalInterface;
  
  import org.bigbluebutton.main.api.JSAPI;
  import org.bigbluebutton.modules.phone.events.AskMicPermissionEvent;
  import org.bigbluebutton.modules.phone.events.PerformEchoTestEvent;
  import org.bigbluebutton.modules.phone.events.RemoveAskMicPermissionEvent;
  import org.bigbluebutton.modules.phone.events.WebRtcEchoTestStartedEvent;

  public class WebRtcCallManager
  {
    private var browserType:String = "unknown";
    var dispatcher:Dispatcher = new Dispatcher();
    
    public function WebRtcCallManager()
    {
      browserType = JSAPI.getInstance().getBrowserType();
    }
    
    
    public function initialize():void {
      //var dispatcher:Dispatcher = new Dispatcher();
      //dispatcher.dispatchEvent(new PerformEchoTestEvent("webrtc"));            
      ExternalInterface.call("startWebrtcAudioTest");
      askMicPermission();
    }
    
    public function askMicPermission():void {      
      dispatcher.dispatchEvent(new AskMicPermissionEvent(browserType));       
    }
    
    public function hideMicPermission():void {
      dispatcher.dispatchEvent(new RemoveAskMicPermissionEvent());
    }
    
    public function handleWebRtcEchoTestStarted():void {
      hideMicPermission();
      dispatcher.dispatchEvent(new WebRtcEchoTestStartedEvent());
    }
    
    public function performEchoTest():void {
      
    }
    
    public function joinVoiceConference():void {
      
    }
    
    public function leaveVoiceConference():void {
      
    }
  }
}
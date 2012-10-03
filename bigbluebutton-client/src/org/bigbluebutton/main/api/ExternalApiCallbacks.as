package org.bigbluebutton.main.api
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.external.ExternalInterface;
  
  import mx.controls.Alert;
  
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.main.events.BBBEvent;
  import org.bigbluebutton.modules.videoconf.events.OpenPublishWindowEvent;

  public class ExternalApiCallbacks
  {
    private var _dispatcher:Dispatcher;
    
    public function ExternalApiCallbacks()
    {
      _dispatcher = new Dispatcher();
      
      init();
    }
    
    private function init():void {
      if (ExternalInterface.available) {
        LogUtil.debug("******************** INITING CALLBACKS ******************************");
        ExternalInterface.addCallback("joinVoice", handleJoinVoiceRequest);
        ExternalInterface.addCallback("getMyRole", handleGetMyRoleRequest);
        ExternalInterface.addCallback("muteUser", placeHolder);
        ExternalInterface.addCallback("unmuteUser", placeHolder);
        ExternalInterface.addCallback("shareVideoCamera", onShareVideoCamera);
        ExternalInterface.addCallback("unshareVideo", placeHolder);        
      }
    }
    
    private function placeHolder():void {
      LogUtil.debug("Placeholder");
    }
    
    private function handleGetMyRoleRequest():void {
      
    }
    
    private function handleJoinVoiceRequest():void {
      LogUtil.debug("handleJoinVoiceRequest");
      _dispatcher.dispatchEvent(new BBBEvent(BBBEvent.JOIN_VOICE_CONFERENCE));
    }
    
    private function onShareVideoCamera():void {
      LogUtil.debug("Sharing webcam");
      _dispatcher.dispatchEvent(new OpenPublishWindowEvent());
    }
    
  }
}
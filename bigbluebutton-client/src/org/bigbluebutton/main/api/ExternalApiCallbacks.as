package org.bigbluebutton.main.api
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.external.ExternalInterface;
  
  import mx.controls.Alert;
  
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.EventConstants;
  import org.bigbluebutton.core.events.CoreEvent;
  import org.bigbluebutton.core.managers.UserManager;
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
        ExternalInterface.addCallback("joinVoiceRequest", handleJoinVoiceRequest);
        ExternalInterface.addCallback("getMyRoleRequestSync", handleGetMyRoleRequestSync);
        ExternalInterface.addCallback("getMyRoleRequestAsync", handleGetMyRoleRequestAsynch);
        ExternalInterface.addCallback("muteUser", placeHolder);
        ExternalInterface.addCallback("unmuteUser", placeHolder);
        ExternalInterface.addCallback("shareVideoCamera", onShareVideoCamera);
        ExternalInterface.addCallback("unshareVideo", placeHolder);        
      }
    }
    
    private function placeHolder():void {
      LogUtil.debug("Placeholder");
    }
    
    private function handleGetMyRoleRequestSync():String {
      return UserManager.getInstance().getConference().whatsMyRole();
    }
    
    private function handleGetMyRoleRequestAsynch():void {
      LogUtil.debug("handleGetMyRoleRequestAsynch");
      _dispatcher.dispatchEvent(new CoreEvent(EventConstants.GET_MY_ROLE_REQ));
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
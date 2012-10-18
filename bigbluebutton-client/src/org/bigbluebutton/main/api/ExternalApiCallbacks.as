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
  import org.bigbluebutton.modules.listeners.events.ListenersCommand;
  import org.bigbluebutton.modules.videoconf.events.ShareCameraRequestEvent;

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
        ExternalInterface.addCallback("muteMeRequest", handleMuteMeRequest);
        ExternalInterface.addCallback("unmuteMeRequest", handleUnmuteMeRequest);
        ExternalInterface.addCallback("muteAllUsersRequest", handleMuteAllUsersRequest);
        ExternalInterface.addCallback("unmuteAllUsersRequest", handleUnmuteAllUsersRequest);
        ExternalInterface.addCallback("shareVideoCamera", onShareVideoCamera);
        ExternalInterface.addCallback("switchLayout", handleSwitchLayoutRequest);
        ExternalInterface.addCallback("unshareVideo", placeHolder);        
      }
    }
    
    private function placeHolder():void {
      LogUtil.debug("Placeholder");
    }

    private function handleSwitchLayoutRequest(newLayout:String):void {
      var layoutEvent:CoreEvent = new CoreEvent(EventConstants.SWITCH_LAYOUT_REQ);
      layoutEvent.message.layoutName = newLayout;
      _dispatcher.dispatchEvent(layoutEvent);
    }
    
    private function handleMuteAllUsersRequest():void {
      _dispatcher.dispatchEvent(new ListenersCommand(ListenersCommand.MUTE_ALL));
    }
    
    private function handleUnmuteAllUsersRequest():void {
      _dispatcher.dispatchEvent(new ListenersCommand(ListenersCommand.UNMUTE_ALL));
    }
    
    private function handleMuteMeRequest():void {
      var e:ListenersCommand = new ListenersCommand(ListenersCommand.MUTE_USER);
      e.userid = UserManager.getInstance().getConference().getMyVoiceUserId();
      e.mute = true;
      _dispatcher.dispatchEvent(e);
    }

    private function handleUnmuteMeRequest():void {
      var e:ListenersCommand = new ListenersCommand(ListenersCommand.MUTE_USER);
      e.userid = UserManager.getInstance().getConference().getMyVoiceUserId();
      e.mute = false;
      _dispatcher.dispatchEvent(e);
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
      _dispatcher.dispatchEvent(new ShareCameraRequestEvent());
    }
    
  }
}
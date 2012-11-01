package org.bigbluebutton.main.api
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.external.ExternalInterface;
  
  import mx.controls.Alert;
  
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.EventConstants;
  import org.bigbluebutton.core.UsersUtil;
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
        ExternalInterface.addCallback("sendPublicChatRequest", handleSendPublicChatRequest);  
        ExternalInterface.addCallback("sendPrivateChatRequest", handleSendPrivateChatRequest); 
        ExternalInterface.addCallback("lockLayout", handleSendLockLayoutRequest);
      }
    }

    private function handleSendLockLayoutRequest(lock:Boolean):void {
      if (lock) {
        var lockEvent:CoreEvent = new CoreEvent(EventConstants.LOCK_LAYOUT_REQ);
        lockEvent.message.lock = lock;
        _dispatcher.dispatchEvent(lockEvent);        
      } else {
        var unlockEvent:CoreEvent = new CoreEvent(EventConstants.UNLOCK_LAYOUT_REQ);
        unlockEvent.message.lock = lock;
        _dispatcher.dispatchEvent(unlockEvent);        
      }

    }
    
    /**
    * Request to send a public chat
    *  fromUserID - the external user id for the sender
    *  fontColor  - the color of the font to display the message
    *  localeLang - the 2-char locale code (e.g. en) for the sender
    *  message    - the message to send
    * 
    */
    private function handleSendPublicChatRequest(fontColor:String, localeLang:String, message:String):void {
      LogUtil.debug("handleSendPublicChatRequest");
      var chatEvent:CoreEvent = new CoreEvent(EventConstants.SEND_PUBLIC_CHAT_REQ);      
      var payload:Object = new Object();      
      payload.fromColor = fontColor;
      payload.fromLang = localeLang;
      
      var now:Date = new Date();
      payload.fromTime = now.getTime();
      payload.fromTimezoneOffset = now.getTimezoneOffset();
      
      payload.message = message;
      
      // Need to convert the internal user id to external user id in case the 3rd-party app passed 
      // an external user id for it's own use.
      payload.fromUserID = UsersUtil.getMyUserID();
      payload.fromUsername = UsersUtil.getUserName(payload.fromUserID);
      
      chatEvent.message = payload;
      
      _dispatcher.dispatchEvent(chatEvent);
    }
    
    /**
     * Request to send a private chat
     *  fromUserID - the external user id for the sender
     *  fontColor  - the color of the font to display the message
     *  localeLang - the 2-char locale code (e.g. en) for the sender
     *  message    - the message to send
     *  toUserID   - the external user id of the receiver
     */
    private function handleSendPrivateChatRequest(fontColor:String, localeLang:String, message:String, toUserID:String):void {
      var chatEvent:CoreEvent = new CoreEvent(EventConstants.SEND_PRIVATE_CHAT_REQ);      
      var payload:Object = new Object();      
      payload.fromColor = fontColor;
      payload.fromLang = localeLang;
      
      var now:Date = new Date();
      payload.fromTime = now.getTime();
      payload.fromTimezoneOffset = now.getTimezoneOffset();
      
      payload.message = message;
      
      // Need to convert the internal user id to external user id in case the 3rd-party app passed 
      // an external user id for it's own use.
      payload.fromUserID = UsersUtil.getMyUserID();
      // Now get the user's name using the internal user id 
      payload.fromUsername = UsersUtil.getUserName(payload.fromUserID);

      // Need to convert the internal user id to external user id in case the 3rd-party app passed 
      // an external user id for it's own use.
      payload.toUserID = UsersUtil.externalUserIDToInternalUserID(toUserID);
      // Now get the user's name using the internal user id 
      payload.toUsername = UsersUtil.getUserName(payload.toUserID);
      
      chatEvent.message = payload;
      
      _dispatcher.dispatchEvent(chatEvent);
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
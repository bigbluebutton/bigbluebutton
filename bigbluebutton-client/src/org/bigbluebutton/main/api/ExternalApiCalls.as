package org.bigbluebutton.main.api
{
  import flash.external.ExternalInterface;
  
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.EventConstants;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.events.AmIPresenterQueryEvent;
  import org.bigbluebutton.core.events.AmISharingWebcamQueryEvent;
  import org.bigbluebutton.core.events.CoreEvent;
  import org.bigbluebutton.core.managers.UserManager;
  import org.bigbluebutton.core.vo.CameraSettingsVO;
  import org.bigbluebutton.main.events.BBBEvent;
  import org.bigbluebutton.main.events.UserJoinedEvent;
  import org.bigbluebutton.main.events.UserLeftEvent;
  import org.bigbluebutton.main.model.users.BBBUser;
  import org.bigbluebutton.main.model.users.events.BroadcastStartedEvent;
  import org.bigbluebutton.main.model.users.events.StreamStartedEvent;
  import org.bigbluebutton.modules.videoconf.model.VideoConfOptions;


  public class ExternalApiCalls { 
    
    public function handleStreamStartedEvent(event:StreamStartedEvent):void {
      var vidConf:VideoConfOptions = new VideoConfOptions();
      
      var payload:Object = new Object();
      payload.eventName = EventConstants.CAM_STREAM_SHARED;
      payload.userID = UsersUtil.internalUserIDToExternalUserID(event.userID);
      payload.uri = vidConf.uri;
      payload.streamName = event.stream;
      
      broadcastEvent(payload);
    }
    
    public function handleBroadcastStartedEvent(event:BroadcastStartedEvent):void {
      var vidConf:VideoConfOptions = new VideoConfOptions();
      
      var payload:Object = new Object();
      payload.eventName = EventConstants.BROADCASTING_CAM_STARTED;
      payload.isPresenter = UsersUtil.amIPresenter();
      payload.streamName = event.stream;
      payload.isPublishing = event.camSettings.isPublishing;
      payload.camIndex = event.camSettings.camIndex;
      payload.camWidth = event.camSettings.camWidth;
      payload.camHeight = event.camSettings.camHeight;
      payload.camKeyFrameInterval = vidConf.camKeyFrameInterval;
      payload.camModeFps = vidConf.camModeFps;
      payload.camQualityBandwidth = vidConf.camQualityBandwidth;
      payload.camQualityPicture = vidConf.camQualityPicture;
      
      broadcastEvent(payload);         
    }
    
    public function handleAmISharingCamQueryEvent(event:AmISharingWebcamQueryEvent):void {
      var camSettings:CameraSettingsVO = UsersUtil.amIPublishing();
      
      var payload:Object = new Object();
      payload.eventName = EventConstants.AM_I_SHARING_CAM_RESP;
      payload.isPublishing = camSettings.isPublishing;
      payload.camIndex = camSettings.camIndex;
      payload.camWidth = camSettings.camWidth;
      payload.camHeight = camSettings.camHeight;
      
      broadcastEvent(payload);        
    }
    

    public function handleAmIPresenterQueryEvent(event:AmIPresenterQueryEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.AM_I_PRESENTER_RESP;
      payload.amIPresenter = UsersUtil.amIPresenter();
      broadcastEvent(payload);        
    }
    
    public function handleSwitchToNewRoleEvent(event:CoreEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.NEW_ROLE;
      payload.role = event.message.role;
      broadcastEvent(payload);        
    }

    public function handleStartPrivateChatEvent(event:CoreEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.START_PRIVATE_CHAT;
      payload.chatWith = UsersUtil.internalUserIDToExternalUserID(event.message.chatWith);
      broadcastEvent(payload);        
    }
    
    public function handleGetMyRoleResponse(event:CoreEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.GET_MY_ROLE_RESP;
      payload.myRole = event.message.myRole;
      broadcastEvent(payload);        
    }

    public function handleUserJoinedVoiceEvent(event:BBBEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.USER_JOINED_VOICE;
      payload.userID = UsersUtil.internalUserIDToExternalUserID(event.payload.userID);
      
      trace("Notifying external API that [" + UsersUtil.getUserName(event.payload.userID) + "] has joined the voice conference.");
      
      broadcastEvent(payload);
    }
    
    public function handleUserVoiceMutedEvent(event:BBBEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.USER_MUTED_VOICE;
      payload.userID = UsersUtil.internalUserIDToExternalUserID(event.payload.userID);
      payload.muted = event.payload.muted;
      
      trace("Notifying external API that [" + UsersUtil.getUserName(event.payload.userID) + "] is now muted=[" + payload.muted + "]");
      broadcastEvent(payload);
    }
    
    public function handleUserVoiceLockedEvent(event:BBBEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.USER_LOCKED_VOICE;
      payload.userID = UsersUtil.internalUserIDToExternalUserID(event.payload.userID);
      payload.locked = event.payload.locked;
      
      trace("Notifying external API that [" + UsersUtil.getUserName(event.payload.userID) + "] is now locked=[" + payload.locked + "]");
      broadcastEvent(payload);
    }
    
    public function handleUserVoiceLeftEvent(event:BBBEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.USER_LEFT_VOICE;
      payload.userID = UsersUtil.internalUserIDToExternalUserID(event.payload.userID);
      
      trace("Notifying external API that [" + UsersUtil.getUserName(event.payload.userID) + "] has left the voice conference.");
      
      broadcastEvent(payload);
    }
    
    public function handleSwitchedLayoutEvent(layoutID:String):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.SWITCHED_LAYOUT;
      payload.layoutID = layoutID;
      broadcastEvent(payload);
    }
        
    public function handleNewPublicChatEvent(event:CoreEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.NEW_PUBLIC_CHAT;
      payload.chatType = event.message.chatType;      
      payload.fromUsername = event.message.fromUsername;
      payload.fromColor = event.message.fromColor;
      payload.fromLang = event.message.fromLang;
      payload.fromTime = event.message.fromTime;      
      payload.fromTimezoneOffset = event.message.fromTimezoneOffset;
      payload.message = event.message.message;
      
      // Need to convert the internal user id to external user id in case the 3rd-party app passed 
      // an external user id for it's own use.
      payload.fromUserID = UsersUtil.internalUserIDToExternalUserID(event.message.fromUserID);
      
      broadcastEvent(payload);
    }
    
    public function handleNewPrivateChatEvent(event:CoreEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.NEW_PRIVATE_CHAT;
      payload.chatType = event.message.chatType;      
      payload.fromUsername = event.message.fromUsername;
      payload.fromColor = event.message.fromColor;
      payload.fromLang = event.message.fromLang;
      payload.fromTime = event.message.fromTime;    
      payload.fromTimezoneOffset = event.message.fromTimezoneOffset;
      payload.toUsername = event.message.toUsername;
      payload.message = event.message.message;
      
      // Need to convert the internal user id to external user id in case the 3rd-party app passed 
      // an external user id for it's own use.
      payload.fromUserID = UsersUtil.internalUserIDToExternalUserID(event.message.fromUserID);
      payload.toUserID = UsersUtil.internalUserIDToExternalUserID(event.message.toUserID);
      
      broadcastEvent(payload);
    }
        
    public function handleUserJoinedEvent(event:UserJoinedEvent):void {
      var payload:Object = new Object();
      var user:BBBUser = UserManager.getInstance().getConference().getUser(event.userID);
      
      if (user == null) {
        LogUtil.warn("[ExternalApiCall:handleParticipantJoinEvent] Cannot find user with ID [" + event.userID + "]");
        return;
      }
      
      payload.eventName = EventConstants.USER_JOINED;
      payload.userID = user.userID;
      payload.userName = user.name;        
      
      broadcastEvent(payload);        
    }    

    public function handleUserLeftEvent(event:UserLeftEvent):void {
      var payload:Object = new Object();
      var user:BBBUser = UserManager.getInstance().getConference().getUser(event.userID);
      
      if (user == null) {
        LogUtil.warn("[ExternalApiCall:handleParticipantJoinEvent] Cannot find user with ID [" + event.userID + "]");
        return;
      }
      
      payload.eventName = EventConstants.USER_LEFT;
      payload.userID = user.userID;
      
      broadcastEvent(payload);        
    }  
    
    private function broadcastEvent(message:Object):void {
      if (ExternalInterface.available) {
        ExternalInterface.call("BBB.handleFlashClientBroadcastEvent", message);
      }      
    }
  }
}
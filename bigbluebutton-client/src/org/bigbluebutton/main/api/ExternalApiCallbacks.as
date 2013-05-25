/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.bigbluebutton.main.api
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.external.ExternalInterface;
  
  import mx.controls.Alert;
  
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.EventConstants;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.events.AmIPresenterQueryEvent;
  import org.bigbluebutton.core.events.AmISharingWebcamQueryEvent;
  import org.bigbluebutton.core.events.CoreEvent;
  import org.bigbluebutton.core.events.GetMyUserInfoRequestEvent;
  import org.bigbluebutton.core.events.IsUserPublishingCamRequest;
  import org.bigbluebutton.core.events.VoiceConfEvent;
  import org.bigbluebutton.core.managers.UserManager;
  import org.bigbluebutton.core.vo.CameraSettingsVO;
  import org.bigbluebutton.main.events.BBBEvent;
  import org.bigbluebutton.main.model.users.events.KickUserEvent;
  import org.bigbluebutton.main.model.users.events.RoleChangeEvent;
  import org.bigbluebutton.modules.videoconf.events.ClosePublishWindowEvent;
  import org.bigbluebutton.modules.videoconf.events.ShareCameraRequestEvent;
  import org.bigbluebutton.modules.videoconf.model.VideoConfOptions;

  public class ExternalApiCallbacks
  {
    private var _dispatcher:Dispatcher;
    
    public function ExternalApiCallbacks() {
      _dispatcher = new Dispatcher();
      
      init();
    }
    
    private function init():void {
      if (ExternalInterface.available) {
        ExternalInterface.addCallback("ejectUserRequest", handleEjectUserRequest);
        ExternalInterface.addCallback("switchPresenterRequest", handleSwitchPresenterRequest);
        ExternalInterface.addCallback("getMyUserInfoSync", handleGetMyUserInfoSynch);
        ExternalInterface.addCallback("getMyUserInfoAsync", handleGetMyUserInfoAsynch);
        ExternalInterface.addCallback("getPresenterUserID", handleGetPresenterUserID);
        ExternalInterface.addCallback("getMyUserID", handleGetMyUserID);
        ExternalInterface.addCallback("getExternalMeetingID", handleGetExternalMeetingID);
        ExternalInterface.addCallback("getInternalMeetingID", handleGetInternalMeetingID);
        ExternalInterface.addCallback("joinVoiceRequest", handleJoinVoiceRequest);
        ExternalInterface.addCallback("leaveVoiceRequest", handleLeaveVoiceRequest);   
        ExternalInterface.addCallback("isUserPublishingCamRequestSync", handleIsUserPublishingCamRequestSync);
        ExternalInterface.addCallback("isUserPublishingCamRequestAsync", handleIsUserPublishingCamRequestAsync);
        ExternalInterface.addCallback("getMyRoleRequestSync", handleGetMyRoleRequestSync);
        ExternalInterface.addCallback("getMyRoleRequestAsync", handleGetMyRoleRequestAsynch);
        ExternalInterface.addCallback("amIPresenterRequestSync", handleAmIPresenterRequestSync);
        ExternalInterface.addCallback("amIPresenterRequestAsync", handleAmIPresenterRequestAsync);
        ExternalInterface.addCallback("amISharingCameraRequestSync", handleAmISharingCameraRequestSync);
        ExternalInterface.addCallback("amISharingCameraRequestAsync", handleAmISharingCameraRequestAsync);
        ExternalInterface.addCallback("muteMeRequest", handleMuteMeRequest);
        ExternalInterface.addCallback("unmuteMeRequest", handleUnmuteMeRequest);
        ExternalInterface.addCallback("muteAllUsersRequest", handleMuteAllUsersRequest);
        ExternalInterface.addCallback("unmuteAllUsersRequest", handleUnmuteAllUsersRequest);
        ExternalInterface.addCallback("shareVideoCamera", onShareVideoCamera);
        ExternalInterface.addCallback("stopShareCameraRequest", handleStopShareCameraRequest);
        ExternalInterface.addCallback("switchLayout", handleSwitchLayoutRequest);
        ExternalInterface.addCallback("sendPublicChatRequest", handleSendPublicChatRequest);  
        ExternalInterface.addCallback("sendPrivateChatRequest", handleSendPrivateChatRequest); 
        ExternalInterface.addCallback("lockLayout", handleSendLockLayoutRequest);
      }
      
      // Tell out JS counterpart that we are ready.
      if (ExternalInterface.available) {
        ExternalInterface.call("BBB.swfClientIsReady");
      }  
      
    }

    private function handleIsUserPublishingCamRequestAsync(userID:String):void {
      var event:IsUserPublishingCamRequest = new IsUserPublishingCamRequest();
      event.userID = UsersUtil.externalUserIDToInternalUserID(userID);
      if (event.userID != null) {
        _dispatcher.dispatchEvent(event);
      } else {
        LogUtil.warn("Cannot find user with external userID [" + userID + "] to query is sharing webcam or not.");
      }
    }
 
    private function handleEjectUserRequest(userID:String):void {
        var intUserID:String = UsersUtil.externalUserIDToInternalUserID(userID);
        _dispatcher.dispatchEvent(new KickUserEvent(intUserID));
    }
    
    private function handleIsUserPublishingCamRequestSync(userID:String):Object {
      var obj:Object = new Object();
      var isUserPublishing:Boolean = false;
      
      var streamName:String = UsersUtil.getWebcamStream(UsersUtil.externalUserIDToInternalUserID(userID));
      if (streamName != null) {
        isUserPublishing = true; 
      }
      
      var vidConf:VideoConfOptions = new VideoConfOptions();
      obj.uri = vidConf.uri + "/" + UsersUtil.getInternalMeetingID();
      obj.userID = userID;
      obj.isUserPublishing = isUserPublishing;
      obj.streamName = streamName;
      
      return obj;
    }
    
    private function handleGetMyUserInfoAsynch():void {
      _dispatcher.dispatchEvent(new GetMyUserInfoRequestEvent());
    }
    
    private function handleGetMyUserInfoSynch():Object {
      var obj:Object = new Object();
      obj.myUserID = UsersUtil.internalUserIDToExternalUserID(UsersUtil.getMyUserID());
      obj.myUsername = UsersUtil.getMyUsername();
      obj.myAvatarURL = UsersUtil.getAvatarURL();
      obj.myRole = UsersUtil.getMyRole();
      obj.amIPresenter = UsersUtil.amIPresenter();
	  obj.dialNumber = UsersUtil.getDialNumber();
	  obj.voiceBridge = UsersUtil.getVoiceBridge();
	  obj.customdata = UsersUtil.getCustomData();
      
      return obj;
    }
    
    private function handleAmISharingCameraRequestSync():Object {
      var obj:Object = new Object();
      var camSettings:CameraSettingsVO = UsersUtil.amIPublishing();
      obj.isPublishing = camSettings.isPublishing;
      obj.camIndex = camSettings.camIndex;
      obj.camWidth = camSettings.camWidth;
      obj.camHeight = camSettings.camHeight;
      
      var vidConf:VideoConfOptions = new VideoConfOptions();
      
      obj.camKeyFrameInterval = vidConf.camKeyFrameInterval;
      obj.camModeFps = vidConf.camModeFps;
      obj.camQualityBandwidth = vidConf.camQualityBandwidth;
      obj.camQualityPicture = vidConf.camQualityPicture;  
      obj.avatarURL = UsersUtil.getAvatarURL();
      return obj;
    }
    
    private function handleAmISharingCameraRequestAsync():void {
      _dispatcher.dispatchEvent(new AmISharingWebcamQueryEvent());
    }
    

    private function handleAmIPresenterRequestSync():Boolean {
      return UsersUtil.amIPresenter();
    }
    
    private function handleAmIPresenterRequestAsync():void {
      _dispatcher.dispatchEvent(new AmIPresenterQueryEvent());
    }

    private function handleStopShareCameraRequest():void {
      _dispatcher.dispatchEvent(new ClosePublishWindowEvent());	
    }
    
    private function handleSwitchPresenterRequest(userID:String):void {
      var intUserID:String = UsersUtil.externalUserIDToInternalUserID(userID);
      trace("Switching presenter to [" + intUserID + "] [" + UsersUtil.getUserName(intUserID) + "]"); 
      
      var e:RoleChangeEvent = new RoleChangeEvent(RoleChangeEvent.ASSIGN_PRESENTER);
      e.userid = intUserID;
      e.username = UsersUtil.getUserName(intUserID);
      _dispatcher.dispatchEvent(e);
    }
    
    private function handleGetMyUserID():String {
      return UsersUtil.internalUserIDToExternalUserID(UsersUtil.getMyUserID());
    }
    
    private function handleGetPresenterUserID():String {
      var presUserID:String = UsersUtil.getPresenterUserID();
      if (presUserID != "") {
        return UsersUtil.internalUserIDToExternalUserID(presUserID);
      }
      // return an empty string. Meeting has no presenter.
      return "";
    }
    
    private function handleGetExternalMeetingID():String {
      return UserManager.getInstance().getConference().externalMeetingID;
    }

    private function handleGetInternalMeetingID():String {
      return UserManager.getInstance().getConference().internalMeetingID;
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
      trace("handleSendPublicChatRequest");
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
      _dispatcher.dispatchEvent(new VoiceConfEvent(VoiceConfEvent.MUTE_ALL));
    }
    
    private function handleUnmuteAllUsersRequest():void {
      _dispatcher.dispatchEvent(new VoiceConfEvent(VoiceConfEvent.UNMUTE_ALL));
    }
    
    private function handleMuteMeRequest():void {
      var e:VoiceConfEvent = new VoiceConfEvent(VoiceConfEvent.MUTE_USER);
      e.userid = UserManager.getInstance().getConference().getMyVoiceUserId();
      e.mute = true;
      _dispatcher.dispatchEvent(e);
    }

    private function handleUnmuteMeRequest():void {
      var e:VoiceConfEvent = new VoiceConfEvent(VoiceConfEvent.MUTE_USER);
      e.userid = UserManager.getInstance().getConference().getMyVoiceUserId();
      e.mute = false;
      _dispatcher.dispatchEvent(e);
    }
    
    private function handleGetMyRoleRequestSync():String {
      return UserManager.getInstance().getConference().whatsMyRole();
    }
    
    private function handleGetMyRoleRequestAsynch():void {
      trace("handleGetMyRoleRequestAsynch");
      _dispatcher.dispatchEvent(new CoreEvent(EventConstants.GET_MY_ROLE_REQ));
    }
    
    private function handleJoinVoiceRequest():void {
      trace("handleJoinVoiceRequest");
      var showMicEvent:BBBEvent = new BBBEvent("SHOW_MIC_SETTINGS");
      _dispatcher.dispatchEvent(showMicEvent);
    }
    
    private function handleLeaveVoiceRequest():void {
      var leaveEvent:BBBEvent = new BBBEvent("LEAVE_VOICE_CONFERENCE_EVENT");
      leaveEvent.payload["userRequested"] = true;
      _dispatcher.dispatchEvent(leaveEvent);
    }
    
    private function onShareVideoCamera(publishInClient:Boolean=true):void {
      trace("Sharing webcam: publishInClient = [" + publishInClient + "]");
      var event:ShareCameraRequestEvent = new ShareCameraRequestEvent();
      event.publishInClient = publishInClient;
      
      _dispatcher.dispatchEvent(event);
    }
    
  }
}
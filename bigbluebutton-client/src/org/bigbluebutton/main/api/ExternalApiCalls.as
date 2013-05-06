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
  import flash.external.ExternalInterface;
  
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.common.Role;
  import org.bigbluebutton.core.EventConstants;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.events.AmIPresenterQueryEvent;
  import org.bigbluebutton.core.events.AmISharingWebcamQueryEvent;
  import org.bigbluebutton.core.events.CoreEvent;
  import org.bigbluebutton.core.events.GetMyUserInfoRequestEvent;
  import org.bigbluebutton.core.events.IsUserPublishingCamRequest;
  import org.bigbluebutton.core.events.SwitchedLayoutEvent;
  import org.bigbluebutton.core.managers.UserManager;
  import org.bigbluebutton.core.vo.CameraSettingsVO;
  import org.bigbluebutton.main.events.BBBEvent;
  import org.bigbluebutton.main.events.SwitchedPresenterEvent;
  import org.bigbluebutton.main.events.UserJoinedEvent;
  import org.bigbluebutton.main.events.UserLeftEvent;
  import org.bigbluebutton.main.model.users.BBBUser;
  import org.bigbluebutton.main.model.users.events.BroadcastStartedEvent;
  import org.bigbluebutton.main.model.users.events.BroadcastStoppedEvent;
  import org.bigbluebutton.main.model.users.events.StreamStartedEvent;
  import org.bigbluebutton.modules.videoconf.model.VideoConfOptions;


  public class ExternalApiCalls { 
    
    public function handleIsUserPublishingCamRequest(event:IsUserPublishingCamRequest):void {
      var payload:Object = new Object();
      var isUserPublishing:Boolean = false;
      
      var streamName:String = UsersUtil.getWebcamStream(event.userID);
      if (streamName != null) {
        isUserPublishing = true; 
      }
      
      payload.eventName = EventConstants.IS_USER_PUBLISHING_CAM_RESP;
      payload.userID = UsersUtil.internalUserIDToExternalUserID(event.userID);
      payload.isUserPublishing = isUserPublishing;
      
      var vidConf:VideoConfOptions = new VideoConfOptions();
      payload.uri = vidConf.uri + "/" + UsersUtil.getInternalMeetingID();
      
      payload.streamName = streamName; 
      broadcastEvent(payload);
    }
    
    public function handleGetMyUserInfoRequest(event:GetMyUserInfoRequestEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.GET_MY_USER_INFO_REP;
      payload.myUserID = UsersUtil.internalUserIDToExternalUserID(UsersUtil.getMyUserID());
      payload.myUsername = UsersUtil.getMyUsername();
      payload.myAvatarURL = UsersUtil.getAvatarURL();
      payload.myRole = UsersUtil.getMyRole();
      payload.amIPresenter = UsersUtil.amIPresenter();
	  payload.dialNumber = UsersUtil.getDialNumber();
	  payload.voiceBridge = UsersUtil.getVoiceBridge();
	  payload.customdata = UsersUtil.getCustomData();
      
      broadcastEvent(payload);
    } 
    
    public function handleSwitchedLayoutEvent(event:SwitchedLayoutEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.SWITCHED_LAYOUT;
      payload.layoutID = event.layoutID;
      
      broadcastEvent(payload);
    }    
    
    public function handleStreamStartedEvent(event:StreamStartedEvent):void {
      var vidConf:VideoConfOptions = new VideoConfOptions();
      
      var payload:Object = new Object();
      payload.eventName = EventConstants.CAM_STREAM_SHARED;
      payload.userID = UsersUtil.internalUserIDToExternalUserID(event.userID);
      payload.uri = vidConf.uri + "/" + UsersUtil.getInternalMeetingID();
      payload.streamName = event.stream;
      
      broadcastEvent(payload);
    }
    
    public function handleBroadcastStoppedEvent(event:BroadcastStoppedEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.BROADCASTING_CAM_STOPPED;
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
      var vidConf:VideoConfOptions = new VideoConfOptions();
      
      var payload:Object = new Object();
      payload.eventName = EventConstants.AM_I_SHARING_CAM_RESP;
      payload.isPublishing = camSettings.isPublishing;
      payload.camIndex = camSettings.camIndex;
      payload.camWidth = camSettings.camWidth;
      payload.camHeight = camSettings.camHeight;
      payload.camKeyFrameInterval = vidConf.camKeyFrameInterval;
      payload.camModeFps = vidConf.camModeFps;
      payload.camQualityBandwidth = vidConf.camQualityBandwidth;
      payload.camQualityPicture = vidConf.camQualityPicture;
      
      broadcastEvent(payload);        
    }
    

    public function handleAmIPresenterQueryEvent(event:AmIPresenterQueryEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.AM_I_PRESENTER_RESP;
      payload.amIPresenter = UsersUtil.amIPresenter();
      broadcastEvent(payload);        
    }
    
    public function handleSwitchToNewRoleEvent(event:SwitchedPresenterEvent):void {
      trace("ExternalApiCalls:: Got NEW ROLE EVENT presenter = [" + event.amIPresenter + "]");
      var payload:Object = new Object();
      payload.eventName = EventConstants.SWITCHED_PRESENTER;
      payload.amIPresenter = event.amIPresenter;
      payload.role = event.amIPresenter ? Role.PRESENTER : Role.VIEWER;
      payload.newPresenterUserID = UsersUtil.internalUserIDToExternalUserID(event.newPresenterUserID);
      broadcastEvent(payload);
      
      payload.eventName = EventConstants.NEW_ROLE;
      payload.amIPresenter = event.amIPresenter;
      payload.newPresenterUserID = UsersUtil.internalUserIDToExternalUserID(event.newPresenterUserID);
      payload.role = event.amIPresenter ? Role.PRESENTER : Role.VIEWER;
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
      payload.myRole = UserManager.getInstance().getConference().whatsMyRole();
      broadcastEvent(payload);        
    }

    public function handleUserJoinedVoiceEvent(event:BBBEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.USER_JOINED_VOICE;
      payload.userID = UsersUtil.internalUserIDToExternalUserID(event.payload.userID);
      
      trace("ExternalApiCalls:: Notifying external API that [" + UsersUtil.getUserName(event.payload.userID) + "] has joined the voice conference.");
      
      broadcastEvent(payload);
    }
    
    public function handleUserVoiceMutedEvent(event:BBBEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.USER_MUTED_VOICE;
      payload.userID = UsersUtil.internalUserIDToExternalUserID(event.payload.userID);
      payload.muted = event.payload.muted;
      
      trace("ExternalApiCalls:: Notifying external API that [" + UsersUtil.getUserName(event.payload.userID) + "] is now muted=[" + payload.muted + "]");
      broadcastEvent(payload);
    }
    
    public function handleUserVoiceLockedEvent(event:BBBEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.USER_LOCKED_VOICE;
      payload.userID = UsersUtil.internalUserIDToExternalUserID(event.payload.userID);
      payload.locked = event.payload.locked;
      
      trace("ExternalApiCalls:: Notifying external API that [" + UsersUtil.getUserName(event.payload.userID) + "] is now locked=[" + payload.locked + "]");
      broadcastEvent(payload);
    }
    
    public function handleUserVoiceLeftEvent(event:BBBEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.USER_LEFT_VOICE;
      payload.userID = UsersUtil.internalUserIDToExternalUserID(event.payload.userID);
      
      trace("ExternalApiCalls:: Notifying external API that [" + UsersUtil.getUserName(event.payload.userID) + "] has left the voice conference.");
      
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
      payload.userID = UsersUtil.internalUserIDToExternalUserID(user.userID);
      payload.userName = user.name;        
      
      broadcastEvent(payload);        
    }    

    public function handleUserLeftEvent(event:UserLeftEvent):void {
      trace("Got notification that user [" + event.userID + "] has left the meeting");
      
      var payload:Object = new Object();
      var user:BBBUser = UserManager.getInstance().getConference().getUser(event.userID);
      
      if (user == null) {
        trace("[ExternalApiCall:handleParticipantJoinEvent] Cannot find user with ID [" + event.userID + "]");
        LogUtil.warn("[ExternalApiCall:handleParticipantJoinEvent] Cannot find user with ID [" + event.userID + "]");
        return;
      }
      
      payload.eventName = EventConstants.USER_LEFT;
      payload.userID = UsersUtil.internalUserIDToExternalUserID(user.userID);
      
      trace("Notifying JS API that user [" + payload.userID + "] has left the meeting");
      
      broadcastEvent(payload);        
    }  
    
    private function broadcastEvent(message:Object):void {
      if (ExternalInterface.available) {
        ExternalInterface.call("BBB.handleFlashClientBroadcastEvent", message);
      }      
    }
  }
}
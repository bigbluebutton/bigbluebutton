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
  
  import mx.collections.ArrayCollection;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.common.Role;
  import org.bigbluebutton.core.EventConstants;
  import org.bigbluebutton.core.Options;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.events.AmIPresenterQueryEvent;
  import org.bigbluebutton.core.events.AmISharingWebcamQueryEvent;
  import org.bigbluebutton.core.events.CoreEvent;
  import org.bigbluebutton.core.events.GetMyUserInfoRequestEvent;
  import org.bigbluebutton.core.events.IsUserPublishingCamRequest;
  import org.bigbluebutton.core.events.SwitchedLayoutEvent;
  import org.bigbluebutton.core.model.LiveMeeting;
  import org.bigbluebutton.core.model.users.User2x;
  import org.bigbluebutton.core.vo.CameraSettingsVO;
  import org.bigbluebutton.main.events.BBBEvent;
  import org.bigbluebutton.main.events.LogoutEvent;
  import org.bigbluebutton.main.events.SwitchedPresenterEvent;
  import org.bigbluebutton.main.events.UserJoinedEvent;
  import org.bigbluebutton.main.events.UserLeftEvent;
  import org.bigbluebutton.main.model.users.events.BroadcastStartedEvent;
  import org.bigbluebutton.main.model.users.events.BroadcastStoppedEvent;
  import org.bigbluebutton.main.model.users.events.StreamStartedEvent;
  import org.bigbluebutton.modules.present.events.ConversionCompletedEvent;
  import org.bigbluebutton.modules.present.events.ConversionPageCountError;
  import org.bigbluebutton.modules.present.events.ConversionPageCountMaxed;
  import org.bigbluebutton.modules.present.events.ConversionSupportedDocEvent;
  import org.bigbluebutton.modules.present.events.ConversionUnsupportedDocEvent;
  import org.bigbluebutton.modules.present.events.ConversionUpdateEvent;
  import org.bigbluebutton.modules.present.events.CreatingThumbnailsEvent;
  import org.bigbluebutton.modules.present.events.GetListOfPresentationsReply;
  import org.bigbluebutton.modules.present.events.OfficeDocConvertFailedEvent;
  import org.bigbluebutton.modules.present.events.OfficeDocConvertInvalidEvent;
  import org.bigbluebutton.modules.present.events.OfficeDocConvertSuccessEvent;
  import org.bigbluebutton.modules.present.events.UploadEvent;
  import org.bigbluebutton.modules.videoconf.model.VideoConfOptions;

  public class ExternalApiCalls { 
	private static const LOGGER:ILogger = getClassLogger(ExternalApiCalls);
    
    public function handleOpenExternalUploadWindow(event:UploadEvent):void {
      var payload:Object = new Object();
      payload.maxFileSize = event.maxFileSize;
      payload.eventName = EventConstants.OPEN_EXTERNAL_UPLOAD_WINDOW;
      broadcastEvent(payload);      
    }
    
    
    public function handleUserKickedOutEvent(event:LogoutEvent):void {
      var payload:Object = new Object();
      payload.userID = event.userID;
      payload.eventName = EventConstants.USER_KICKED_OUT;
      broadcastEvent(payload);
    }
    
    public function handleIsUserPublishingCamRequest(event:IsUserPublishingCamRequest):void {
      var payload:Object = new Object();
      var isUserPublishing:Boolean = false;
      
      var streamNames:Array = UsersUtil.getWebcamStreamsFor(event.userID);
      if (streamNames && streamNames.length > 0) {
        isUserPublishing = true; 
      }
      
      payload.eventName = EventConstants.IS_USER_PUBLISHING_CAM_RESP;
      payload.userID = event.userID;
      payload.isUserPublishing = isUserPublishing;
      
      var vidConf:VideoConfOptions = Options.getOptions(VideoConfOptions) as VideoConfOptions;
      payload.uri = vidConf.uri + "/" + UsersUtil.getInternalMeetingID();
      payload.avatarURL = UsersUtil.getAvatarURL();
      payload.streamNames = streamNames;
      broadcastEvent(payload);
    }
    
    public function handleGetMyUserInfoRequest(event:GetMyUserInfoRequestEvent):void {  
      var payload:Object = new Object();
      payload.eventName = EventConstants.GET_MY_USER_INFO_REP;
      payload.myUserID = UsersUtil.getMyUserID();
	  payload.myExternalUserID = UsersUtil.getMyExternalUserID();
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
      var vidConf:VideoConfOptions = Options.getOptions(VideoConfOptions) as VideoConfOptions;
      
      var payload:Object = new Object();
      payload.eventName = EventConstants.CAM_STREAM_SHARED;
      payload.userID = event.userID;
      payload.uri = vidConf.uri + "/" + UsersUtil.getInternalMeetingID();
      payload.streamName = event.stream;
      payload.avatarURL = UsersUtil.getAvatarURL();
      
      broadcastEvent(payload);
    }
    
    public function handleBroadcastStoppedEvent(event:BroadcastStoppedEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.BROADCASTING_CAM_STOPPED;
      payload.avatarURL = event.avatarURL;
      payload.stream = event.stream;
      broadcastEvent(payload);  
    }
    
    public function handleBroadcastStartedEvent(event:BroadcastStartedEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.BROADCASTING_CAM_STARTED;
      payload.isPresenter = UsersUtil.amIPresenter();
      payload.streamName = event.stream;
      payload.isPublishing = event.camSettings.isPublishing;
      payload.camIndex = event.camSettings.camIndex;
      payload.camWidth = event.camSettings.videoProfile.width;
      payload.camHeight = event.camSettings.videoProfile.height;
      payload.camKeyFrameInterval = event.camSettings.videoProfile.keyFrameInterval;
      payload.camModeFps = event.camSettings.videoProfile.modeFps;
      payload.camQualityBandwidth = event.camSettings.videoProfile.qualityBandwidth;
      payload.camQualityPicture = event.camSettings.videoProfile.qualityPicture;
      payload.avatarURL = UsersUtil.getAvatarURL();
      
      broadcastEvent(payload);         
    }
    
    public function handleAmISharingCamQueryEvent(event:AmISharingWebcamQueryEvent):void {
      var camSettingsArray:ArrayCollection = UsersUtil.myCamSettings();
      var payload:Object = new Object();
      var camArray: ArrayCollection = new ArrayCollection();
      for (var i:int = 0; i < camSettingsArray.length; i++) {
        var camSettings:CameraSettingsVO = camSettingsArray.getItemAt(i) as CameraSettingsVO;

        var cam:Object = new Object();
        cam.isPublishing = camSettings.isPublishing;
        cam.camIndex = camSettings.camIndex;
        cam.camWidth = camSettings.videoProfile.width;
        cam.camHeight = camSettings.videoProfile.height;
        cam.camKeyFrameInterval = camSettings.videoProfile.keyFrameInterval;
        cam.camModeFps = camSettings.videoProfile.modeFps;
        cam.camQualityBandwidth = camSettings.videoProfile.qualityBandwidth;
        cam.camQualityPicture = camSettings.videoProfile.qualityPicture;
        cam.avatarURL = UsersUtil.getAvatarURL();
        camArray.addItem(cam);
      }
      payload.eventName = EventConstants.AM_I_SHARING_CAM_RESP;
      payload.cameras = camArray;

      broadcastEvent(payload);
    }
    

    public function handleAmIPresenterQueryEvent(event:AmIPresenterQueryEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.AM_I_PRESENTER_RESP;
      payload.amIPresenter = UsersUtil.amIPresenter();
      broadcastEvent(payload);        
    }
    
    public function handleSwitchToNewRoleEvent(event:SwitchedPresenterEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.SWITCHED_PRESENTER;
      payload.amIPresenter = event.amIPresenter;
      payload.role = event.amIPresenter ? Role.PRESENTER : Role.VIEWER;
      payload.newPresenterUserID = event.newPresenterUserID;
      payload.avatarURL = UsersUtil.getAvatarURL();
      broadcastEvent(payload);
      
      payload.eventName = EventConstants.NEW_ROLE;
      payload.amIPresenter = event.amIPresenter;
      payload.newPresenterUserID = event.newPresenterUserID;
      payload.role = event.amIPresenter ? Role.PRESENTER : Role.VIEWER;
      payload.avatarURL = UsersUtil.getAvatarURL();
      broadcastEvent(payload);      
    }

    public function handleStartPrivateChatEvent(event:CoreEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.START_PRIVATE_CHAT;
      payload.chatWith = event.message.chatWith;
      broadcastEvent(payload);        
    }
    
    public function handleGetMyRoleResponse(event:CoreEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.GET_MY_ROLE_RESP;
      payload.myRole = UsersUtil.getMyRole();
      broadcastEvent(payload);        
    }

    public function handleUserJoinedVoiceEvent(event:BBBEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.USER_JOINED_VOICE;
      payload.userID = event.payload.userID;
	  payload.externalUserID = UsersUtil.internalUserIDToExternalUserID(event.payload.userID);
      broadcastEvent(payload);
    }
    
    public function handleUserVoiceMutedEvent(event:BBBEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.USER_MUTED_VOICE;
      payload.userID = event.payload.userID;
	  payload.externalUserID = UsersUtil.internalUserIDToExternalUserID(event.payload.userID);
      payload.muted = event.payload.muted;
      broadcastEvent(payload);
    }
    
    public function handleUserLockedEvent(event:BBBEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.USER_LOCKED;
      payload.userID = event.payload.userID;
	  payload.externalUserID = UsersUtil.internalUserIDToExternalUserID(event.payload.userID);
      payload.locked = event.payload.locked;
      broadcastEvent(payload);
    }
    
    public function handleUserVoiceLeftEvent(event:BBBEvent):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.USER_LEFT_VOICE;
      payload.userID = event.payload.userID;
	  payload.externalUserID = UsersUtil.internalUserIDToExternalUserID(event.payload.userID);
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
      payload.message = event.message.message;
      
      payload.fromUserID = event.message.fromUserID;
      
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
      payload.toUsername = event.message.toUsername;
      payload.message = event.message.message;
      
      payload.fromUserID = event.message.fromUserID;
      payload.toUserID = event.message.toUserID;
      
      broadcastEvent(payload);
    }
        
    public function handleUserJoinedEvent(event:UserJoinedEvent):void {
      var payload:Object = new Object();
      var user:User2x = LiveMeeting.inst().users.getUser(event.userID);
      
      if (user == null) {
        LOGGER.warn("[ExternalApiCall:handleParticipantJoinEvent] Cannot find user with ID [{0}]", [event.userID]);
        return;
      }
      
      payload.eventName = EventConstants.USER_JOINED;
      payload.userID = user.intId;
      payload.userName = user.name;        
      
      broadcastEvent(payload);        
    }    

    public function handleUserLeftEvent(event:UserLeftEvent):void {
      var payload:Object = new Object();
      var user:User2x = LiveMeeting.inst().users.getUser(event.userID);
      
      if (user == null) {
        LOGGER.warn("[ExternalApiCall:handleParticipantJoinEvent] Cannot find user with ID [{0}]", [event.userID]);
        return;
      }
      
      payload.eventName = EventConstants.USER_LEFT;
      payload.userID = user.intId;
      
      broadcastEvent(payload);        
    }

    public function handleOfficeDocConversionSuccess(event:OfficeDocConvertSuccessEvent):void{
      var payload:Object = new Object();
      payload.eventName = EventConstants.OFFICE_DOC_CONVERSION_SUCCESS;
      broadcastEvent(payload);
    }
	
	public function handleOfficeDocConversionInvalid(event:OfficeDocConvertInvalidEvent):void{
		var payload:Object = new Object();
		payload.eventName = EventConstants.OFFICE_DOC_CONVERSION_INVALID;
		broadcastEvent(payload);
	}

    public function handleOfficeDocConversionFailed(event:OfficeDocConvertFailedEvent):void{
      var payload:Object = new Object();
      payload.eventName = EventConstants.OFFICE_DOC_CONVERSION_FAILED;
      broadcastEvent(payload);
    }

    public function handleSupportedDocument(event:ConversionSupportedDocEvent):void{
      var payload:Object = new Object();
      payload.eventName = EventConstants.SUPPORTED_DOCUMENT;
      broadcastEvent(payload);
    }

    public function handleUnsupportedDocument(event:ConversionUnsupportedDocEvent):void{
      var payload:Object = new Object();
      payload.eventName = EventConstants.UNSUPPORTED_DOCUMENT;
      broadcastEvent(payload);
    }

    public function handlePageCountFailed(event:ConversionPageCountError):void{
      var payload:Object = new Object();
      payload.eventName = EventConstants.PAGE_COUNT_FAILED;
      broadcastEvent(payload);
    }

    public function handleThumbnailsUpdate(event:CreatingThumbnailsEvent):void{
      var payload:Object = new Object();
      payload.eventName = EventConstants.THUMBNAILS_UPDATE;
      broadcastEvent(payload);
    }

    public function handlePageCountExceeded(event:ConversionPageCountMaxed):void{
      var payload:Object = new Object();
      payload.eventName = EventConstants.PAGE_COUNT_EXCEEDED;
      payload.maximumSupportedNumberOfSlides = event.maxPages;
      broadcastEvent(payload);
    }

    public function handleConvertSuccess(event:ConversionCompletedEvent):void{
      var payload:Object = new Object();
      payload.eventName = EventConstants.CONVERT_SUCCESS;
      payload.presentationName = event.presName;
      payload.presentationId = event.presId;
      payload.podId = event.podId;
      broadcastEvent(payload);
    }

    public function handleConvertUpdate(event:ConversionUpdateEvent):void{
      var payload:Object = new Object();
      payload.eventName = EventConstants.CONVERT_UPDATE;
      payload.totalSlides = event.totalPages;
      payload.completedSlides = event.numPagesDone;
      broadcastEvent(payload);
    }

    public function handleGetListOfPresentationsReply(event:GetListOfPresentationsReply):void {
      var payload:Object = new Object();
      payload.eventName = EventConstants.QUERY_PRESENTATION_REPLY;
      payload.presentations = event.presentations;
      broadcastEvent(payload);
    }
    
    private function broadcastEvent(message:Object):void {
      if (ExternalInterface.available) {
        ExternalInterface.call("BBB.handleFlashClientBroadcastEvent", message);
      }      
    }
  }
}

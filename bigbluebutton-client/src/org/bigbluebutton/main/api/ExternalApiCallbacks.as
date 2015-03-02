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
  import org.bigbluebutton.main.model.users.events.ChangeStatusEvent;
  import org.bigbluebutton.main.model.users.events.KickUserEvent;
  import org.bigbluebutton.main.model.users.events.RoleChangeEvent;
  import org.bigbluebutton.modules.deskshare.events.DeskshareAppletLaunchedEvent;
  import org.bigbluebutton.modules.deskshare.utils.JavaCheck;
  import org.bigbluebutton.modules.phone.events.AudioSelectionWindowEvent;
  import org.bigbluebutton.modules.phone.events.FlashCallConnectedEvent;
  import org.bigbluebutton.modules.phone.events.FlashCallDisconnectedEvent;
  import org.bigbluebutton.modules.phone.events.WebRTCCallEvent;
  import org.bigbluebutton.modules.phone.events.WebRTCEchoTestEvent;
  import org.bigbluebutton.modules.phone.events.WebRTCMediaEvent;
  import org.bigbluebutton.modules.present.events.GetListOfPresentationsRequest;
  import org.bigbluebutton.modules.present.events.RemovePresentationEvent;
  import org.bigbluebutton.modules.present.events.UploadEvent;
  import org.bigbluebutton.modules.videoconf.events.ClosePublishWindowEvent;
  import org.bigbluebutton.modules.videoconf.events.ShareCameraRequestEvent;
  import org.bigbluebutton.modules.videoconf.events.WebRTCWebcamRequestEvent;
  import org.bigbluebutton.modules.videoconf.model.VideoConfOptions;

  public class ExternalApiCallbacks {
    private static const LOG:String = "ExternalApiCallbacks - ";    
    private var _dispatcher:Dispatcher;
    
    public function ExternalApiCallbacks() {
      _dispatcher = new Dispatcher();     
      init();
    }
    
    private function init():void {
      if (ExternalInterface.available) {
        ExternalInterface.addCallback("raiseHandRequest", handleRaiseHandRequest);
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
        ExternalInterface.addCallback("displayPresentationRequest", handleDisplayPresentationRequest);
        ExternalInterface.addCallback("deletePresentationRequest", handleDeletePresentationRequest);
        ExternalInterface.addCallback("queryListsOfPresentationsRequest", handleQueryListsOfPresentationsRequest);

		ExternalInterface.addCallback("webRTCConferenceCallStarted", handleWebRTCConferenceCallStarted);
		ExternalInterface.addCallback("webRTCConferenceCallConnecting", handleWebRTCConferenceCallConnecting);
        ExternalInterface.addCallback("webRTCConferenceCallEnded", handleWebRTCConferenceCallEnded);
        ExternalInterface.addCallback("webRTCConferenceCallFailed", handleWebRTCConferenceCallFailed);
		ExternalInterface.addCallback("webRTCConferenceCallWaitingForICE", handleWebRTCConferenceCallWaitingForICE);
        ExternalInterface.addCallback("webRTCEchoTestStarted", handleWebRTCEchoTestStarted);
        ExternalInterface.addCallback("webRTCEchoTestConnecting", handleWebRTCEchoTestConnecting);
        ExternalInterface.addCallback("webRTCEchoTestFailed", handleWebRTCEchoTestFailed);
        ExternalInterface.addCallback("webRTCEchoTestEnded", handleWebRTCEchoTestEnded);
		ExternalInterface.addCallback("webRTCEchoTestWaitingForICE", handleWebRTCEchoTestWaitingForICE);
        ExternalInterface.addCallback("webRTCMediaRequest", handleWebRTCMediaRequest);
        ExternalInterface.addCallback("webRTCMediaSuccess", handleWebRTCMediaSuccess);
        ExternalInterface.addCallback("webRTCMediaFail", handleWebRTCMediaFail);
        ExternalInterface.addCallback("webRTCWebcamRequest", handleWebRTCWebcamRequest);
        ExternalInterface.addCallback("webRTCWebcamRequestSuccess", handleWebRTCWebcamRequestSuccess);
        ExternalInterface.addCallback("webRTCWebcamRequestFail", handleWebRTCWebcamRequestFail);
        ExternalInterface.addCallback("javaAppletLaunched", handleJavaAppletLaunched);
      }
      
      // Tell out JS counterpart that we are ready.
      if (ExternalInterface.available) {
        ExternalInterface.call("BBB.swfClientIsReady");
      }        
    }

    private function handleQueryListsOfPresentationsRequest():void {    
      _dispatcher.dispatchEvent(new GetListOfPresentationsRequest());
    }
        
    private function handleDisplayPresentationRequest(presentationID:String):void {
      var readyEvent:UploadEvent = new UploadEvent(UploadEvent.PRESENTATION_READY);
      readyEvent.presentationName = presentationID;
      _dispatcher.dispatchEvent(readyEvent);
    }
    
    private function handleDeletePresentationRequest(presentationID:String):void {
      var rEvent:RemovePresentationEvent = new RemovePresentationEvent(RemovePresentationEvent.REMOVE_PRESENTATION_EVENT);
      rEvent.presentationName = presentationID;
      _dispatcher.dispatchEvent(rEvent);
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
 
    private function handleRaiseHandRequest(handRaised:Boolean):void {
      trace("Received raise hand request from JS API [" + handRaised + "]");
      var userID:String = UserManager.getInstance().getConference().getMyUserId();
      var e:ChangeStatusEvent = new ChangeStatusEvent(userID, handRaised? ChangeStatusEvent.RAISE_HAND: ChangeStatusEvent.CLEAR_STATUS);
      _dispatcher.dispatchEvent(e);
    }
    
    private function handleEjectUserRequest(userID:String):void {
        var intUserID:String = UsersUtil.externalUserIDToInternalUserID(userID);
        _dispatcher.dispatchEvent(new KickUserEvent(intUserID));
    }
    
    private function handleIsUserPublishingCamRequestSync(userID:String):Object {
      var obj:Object = new Object();
      var isUserPublishing:Boolean = false;
      
      var streamNames:Array = UsersUtil.getWebcamStream(UsersUtil.externalUserIDToInternalUserID(userID));
      if (streamNames && streamNames.length > 0) {
        isUserPublishing = true; 
      }
      
      var vidConf:VideoConfOptions = new VideoConfOptions();
      obj.uri = vidConf.uri + "/" + UsersUtil.getInternalMeetingID();
      obj.userID = userID;
      obj.isUserPublishing = isUserPublishing;
      obj.streamNames = streamNames;
      obj.avatarURL = UsersUtil.getAvatarURL();
      
      return obj;
    }
    
    private function handleGetMyUserInfoAsynch():void {
      _dispatcher.dispatchEvent(new GetMyUserInfoRequestEvent());
    }
    
    private function handleGetMyUserInfoSynch():Object {
      trace(LOG + " handleGetMyUserInfoSynch");
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
      obj.camWidth = camSettings.videoProfile.width;
      obj.camHeight = camSettings.videoProfile.height;
      obj.camKeyFrameInterval = camSettings.videoProfile.keyFrameInterval;
      obj.camModeFps = camSettings.videoProfile.modeFps;
      obj.camQualityBandwidth = camSettings.videoProfile.qualityBandwidth;
      obj.camQualityPicture = camSettings.videoProfile.qualityPicture;
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
      trace(LOG + " handleGetMyUserID");
      return UsersUtil.internalUserIDToExternalUserID(UsersUtil.getMyUserID());
    }
    
    private function handleGetPresenterUserID():String {
      trace(LOG + " handleGetPresenterUserID");
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
      e.userid = UserManager.getInstance().getConference().getMyUserId();
      e.mute = true;
      _dispatcher.dispatchEvent(e);
    }

    private function handleUnmuteMeRequest():void {
      var e:VoiceConfEvent = new VoiceConfEvent(VoiceConfEvent.MUTE_USER);
      e.userid = UserManager.getInstance().getConference().getMyUserId();
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
      _dispatcher.dispatchEvent(new AudioSelectionWindowEvent(AudioSelectionWindowEvent.SHOW_AUDIO_SELECTION));
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
    
    private function handleWebRTCConferenceCallStarted():void {
      trace(LOG + "handleWebRTCConferenceCallStarted: recieved");
      _dispatcher.dispatchEvent(new WebRTCCallEvent(WebRTCCallEvent.WEBRTC_CALL_STARTED));
    }
	
	private function handleWebRTCConferenceCallConnecting():void {
		trace(LOG + "handleWebRTCConferenceCallConnecting: recieved");
		_dispatcher.dispatchEvent(new WebRTCCallEvent(WebRTCCallEvent.WEBRTC_CALL_CONNECTING));
	}

    private function handleWebRTCConferenceCallEnded():void {
      trace(LOG + "handleWebRTCConferenceCallEnded: received");
      _dispatcher.dispatchEvent(new WebRTCCallEvent(WebRTCCallEvent.WEBRTC_CALL_ENDED));
    }
    
    private function handleWebRTCConferenceCallFailed(errorCode:Number):void {
      trace(LOG + "handleWebRTCConferenceCallFailed: errorCode=[" + errorCode + "]");
      _dispatcher.dispatchEvent(new WebRTCCallEvent(WebRTCCallEvent.WEBRTC_CALL_FAILED, errorCode));
    }
	
	private function handleWebRTCConferenceCallWaitingForICE():void {
		trace(LOG + "handleWebRTCConferenceCallWaitingForICE: received");
		_dispatcher.dispatchEvent(new WebRTCCallEvent(WebRTCCallEvent.WEBRTC_CALL_WAITING_FOR_ICE));
	}
    
    private function handleWebRTCEchoTestStarted():void {
      trace(LOG + "handleWebRTCEchoTestStarted: recieved");
      _dispatcher.dispatchEvent(new WebRTCEchoTestEvent(WebRTCEchoTestEvent.WEBRTC_ECHO_TEST_STARTED));
    }
	
	private function handleWebRTCEchoTestConnecting():void {
		trace(LOG + "handleWebRTCEchoTestConnecting: recieved");
		_dispatcher.dispatchEvent(new WebRTCEchoTestEvent(WebRTCEchoTestEvent.WEBRTC_ECHO_TEST_CONNECTING));
	}
    
    private function handleWebRTCEchoTestFailed(errorCode:Number):void {
      trace(LOG + "handleWebRTCEchoTestFailed: errorCode=[" + errorCode + "]");
      _dispatcher.dispatchEvent(new WebRTCEchoTestEvent(WebRTCEchoTestEvent.WEBRTC_ECHO_TEST_FAILED, errorCode));
    }
    
    private function handleWebRTCEchoTestEnded():void {
      trace(LOG + "handleWebRTCEchoTestEnded: received");
      _dispatcher.dispatchEvent(new WebRTCEchoTestEvent(WebRTCEchoTestEvent.WEBRTC_ECHO_TEST_ENDED));
    }
	
	private function handleWebRTCEchoTestWaitingForICE():void {
		trace(LOG + "handleWebRTCEchoTestWaitingForICE: received");
		_dispatcher.dispatchEvent(new WebRTCEchoTestEvent(WebRTCEchoTestEvent.WEBRTC_ECHO_TEST_WAITING_FOR_ICE));
	}
    
    private function handleWebRTCMediaRequest():void {
      trace(LOG + "handleWebRTCMediaRequest: received");
      _dispatcher.dispatchEvent(new WebRTCMediaEvent(WebRTCMediaEvent.WEBRTC_MEDIA_REQUEST));
    }
    
    private function handleWebRTCMediaSuccess():void {
      trace(LOG + "handleWebRTCMediaSuccess: received");
      _dispatcher.dispatchEvent(new WebRTCMediaEvent(WebRTCMediaEvent.WEBRTC_MEDIA_SUCCESS));
	}

    private function handleWebRTCMediaFail():void {
      trace(LOG + "handleWebRTCMediaFail: received");
      _dispatcher.dispatchEvent(new WebRTCMediaEvent(WebRTCMediaEvent.WEBRTC_MEDIA_FAIL));
    }

	private function handleWebRTCWebcamRequestFail(cause:String):void
	{
		trace(LOG + "handleWebRTCWebcamFail: received");
		_dispatcher.dispatchEvent(new WebRTCWebcamRequestEvent(WebRTCWebcamRequestEvent.WEBRTC_WEBCAM_FAIL, cause));
	}

	private function handleWebRTCWebcamRequestSuccess():void
	{
		trace(LOG + "handleWebRTCWebcamSuccess: received");
		_dispatcher.dispatchEvent(new WebRTCWebcamRequestEvent(WebRTCWebcamRequestEvent.WEBRTC_WEBCAM_SUCCESS));
	}

	private function handleWebRTCWebcamRequest():void
	{
		trace(LOG + "handleWebRTCWebcamRequest: received");
		_dispatcher.dispatchEvent(new WebRTCWebcamRequestEvent(WebRTCWebcamRequestEvent.WEBRTC_WEBCAM_REQUEST));
	}
	
	private function handleJavaAppletLaunched():void
	{
		trace(LOG + "handleJavaAppletLaunched: received");
		_dispatcher.dispatchEvent(new DeskshareAppletLaunchedEvent(DeskshareAppletLaunchedEvent.APPLET_LAUNCHED));
	}
  }
}

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
  
  import mx.collections.ArrayCollection;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.EventConstants;
  import org.bigbluebutton.core.Options;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.events.AmIPresenterQueryEvent;
  import org.bigbluebutton.core.events.AmISharingWebcamQueryEvent;
  import org.bigbluebutton.core.events.CoreEvent;
  import org.bigbluebutton.core.events.FullscreenToggledEvent;
  import org.bigbluebutton.core.events.GetMyUserInfoRequestEvent;
  import org.bigbluebutton.core.events.IsUserPublishingCamRequest;
  import org.bigbluebutton.core.events.VoiceConfEvent;
  import org.bigbluebutton.core.vo.CameraSettingsVO;
  import org.bigbluebutton.main.events.BBBEvent;
  import org.bigbluebutton.main.model.users.events.EmojiStatusEvent;
  import org.bigbluebutton.main.model.users.events.KickUserEvent;
  import org.bigbluebutton.main.model.users.events.RoleChangeEvent;
  import org.bigbluebutton.modules.phone.events.AudioSelectionWindowEvent;
  import org.bigbluebutton.modules.phone.events.WebRTCCallEvent;
  import org.bigbluebutton.modules.phone.events.WebRTCEchoTestEvent;
  import org.bigbluebutton.modules.phone.events.WebRTCMediaEvent;
  import org.bigbluebutton.modules.present.events.GetListOfPresentationsRequest;
  import org.bigbluebutton.modules.present.events.RemovePresentationEvent;
  import org.bigbluebutton.modules.present.events.UploadEvent;
  import org.bigbluebutton.modules.videoconf.events.ClosePublishWindowEvent;
  import org.bigbluebutton.modules.videoconf.events.ShareCameraRequestEvent;
  import org.bigbluebutton.modules.videoconf.model.VideoConfOptions;

  public class ExternalApiCallbacks {
	private static const LOGGER:ILogger = getClassLogger(ExternalApiCallbacks);
    private var _dispatcher:Dispatcher;
    
    public function ExternalApiCallbacks() {
      _dispatcher = new Dispatcher();     
      init();
    }
    
    private function init():void {
      if (ExternalInterface.available) {
        ExternalInterface.addCallback("emojiStatusRequest", handleEmojiStatusRequest);
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
        ExternalInterface.addCallback("lockLayout", handleSendLockLayoutRequest);
        ExternalInterface.addCallback("displayPresentationRequest", handleDisplayPresentationRequest);
        ExternalInterface.addCallback("deletePresentationRequest", handleDeletePresentationRequest);
        ExternalInterface.addCallback("queryListsOfPresentationsRequest", handleQueryListsOfPresentationsRequest);
        ExternalInterface.addCallback("fullscreenToggled", handleFullscreenToggled);

        ExternalInterface.addCallback("webRTCCallStarted", handleWebRTCCallStarted);
        ExternalInterface.addCallback("webRTCCallConnecting", handleWebRTCCallConnecting);
        ExternalInterface.addCallback("webRTCCallEnded", handleWebRTCCallEnded);
        ExternalInterface.addCallback("webRTCCallFailed", handleWebRTCCallFailed);
        ExternalInterface.addCallback("webRTCCallWaitingForICE", handleWebRTCCallWaitingForICE);
        ExternalInterface.addCallback("webRTCCallTransferring", handleWebRTCCallTransferring);
        ExternalInterface.addCallback("webRTCMediaRequest", handleWebRTCMediaRequest);
        ExternalInterface.addCallback("webRTCMediaSuccess", handleWebRTCMediaSuccess);
        ExternalInterface.addCallback("webRTCMediaFail", handleWebRTCMediaFail);
        ExternalInterface.addCallback("getSessionToken", handleGetSessionToken);
        ExternalInterface.addCallback("webRTCMonitorUpdate", handleWebRTCMonitorUpdate);
      }
      
      // Tell out JS counterpart that we are ready.
      if (ExternalInterface.available) {
        ExternalInterface.call("BBB.swfClientIsReady");
      }        
    }

    private function handleQueryListsOfPresentationsRequest():void {    
      _dispatcher.dispatchEvent(new GetListOfPresentationsRequest("UNKNOWN"));
    }
        
    private function handleDisplayPresentationRequest(presentationID:String):void {
      var readyEvent:UploadEvent = new UploadEvent(UploadEvent.PRESENTATION_READY, "DEFAULT_PRESENTATION_POD");
      readyEvent.presentationName = presentationID;
      _dispatcher.dispatchEvent(readyEvent);
    }
    
    private function handleDeletePresentationRequest(presentationID:String):void {
      var rEvent:RemovePresentationEvent = new RemovePresentationEvent(RemovePresentationEvent.REMOVE_PRESENTATION_EVENT, "unknown");
      rEvent.presentationName = presentationID;
      _dispatcher.dispatchEvent(rEvent);
    }
    
    private function handleIsUserPublishingCamRequestAsync(userID:String):void {
      var event:IsUserPublishingCamRequest = new IsUserPublishingCamRequest();
      event.userID = userID;
      if (event.userID != null) {
        _dispatcher.dispatchEvent(event);
      } else {
        LOGGER.warn("Cannot find user with external userID [{0-}] to query is sharing webcam or not.", [userID]);
      }
    }
 
    private function handleEmojiStatusRequest(emojiStatus:String):void {
      var e:EmojiStatusEvent = new EmojiStatusEvent(EmojiStatusEvent.EMOJI_STATUS, emojiStatus);
      _dispatcher.dispatchEvent(e);
    }
    
    private function handleEjectUserRequest(userID:String):void {
        _dispatcher.dispatchEvent(new KickUserEvent(userID));
    }
    
    private function handleIsUserPublishingCamRequestSync(userID:String):Object {
      var obj:Object = new Object();
      var isUserPublishing:Boolean = false;
      
      var streamNames:Array = UsersUtil.getWebcamStreamsFor(userID);
      if (streamNames && streamNames.length > 0) {
        isUserPublishing = true; 
      }
      
      var vidConf:VideoConfOptions = Options.getOptions(VideoConfOptions) as VideoConfOptions;
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
      var obj:Object = new Object();
      obj.myUserID = UsersUtil.getMyUserID();
	  obj.myExternalUserID = UsersUtil.getMyExternalUserID();
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
      var camArray: ArrayCollection = new ArrayCollection();

      var camSettingsArray:ArrayCollection = UsersUtil.myCamSettings();
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

      obj.cameras = camArray;
      return obj;
    }
    
    private function handleAmISharingCameraRequestAsync():void {
      _dispatcher.dispatchEvent(new AmISharingWebcamQueryEvent());
    }

    private function handleFullscreenToggled(isNowFullscreen: Boolean):void {
      _dispatcher.dispatchEvent(new FullscreenToggledEvent(isNowFullscreen));
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
      var e:RoleChangeEvent = new RoleChangeEvent(RoleChangeEvent.ASSIGN_PRESENTER);
      e.userid = userID;
      e.username = UsersUtil.getUserName(userID);
      _dispatcher.dispatchEvent(e);
    }
    
    private function handleGetMyUserID():String {
      return UsersUtil.getMyUserID();
    }
    
    private function handleGetPresenterUserID():String {
      var presUserID:String = UsersUtil.getPresenterUserID();
      if (presUserID != "") {
        return presUserID;
      }
      // return an empty string. Meeting has no presenter.
      return "";
    }
    
    private function handleGetExternalMeetingID():String {
      return UsersUtil.getExternalMeetingID();
    }

    private function handleGetInternalMeetingID():String {
      return UsersUtil.getInternalMeetingID();
    }
    
    private function handleGetSessionToken():String {
      return BBB.getSessionTokenUtil().getSessionToken();
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
      var chatEvent:CoreEvent = new CoreEvent(EventConstants.SEND_PUBLIC_CHAT_REQ);      
      var payload:Object = new Object();      
      payload.fromColor = fontColor;
      payload.fromLang = localeLang;
      
      var now:Date = new Date();
      payload.fromTime = now.getTime();
      
      payload.message = message;
      
      // Need to convert the internal user id to external user id in case the 3rd-party app passed 
      // an external user id for it's own use.
      payload.fromUserID = UsersUtil.getMyUserID();
      payload.fromUsername = UsersUtil.getUserName(payload.fromUserID);
      
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
      e.userid = UsersUtil.getMyUserID();
      e.mute = true;
      _dispatcher.dispatchEvent(e);
    }

    private function handleUnmuteMeRequest():void {
      var e:VoiceConfEvent = new VoiceConfEvent(VoiceConfEvent.MUTE_USER);
      e.userid = UsersUtil.getMyUserID();
      e.mute = false;
      _dispatcher.dispatchEvent(e);
    }
    
    private function handleGetMyRoleRequestSync():String {
      return UsersUtil.getMyRole();
    }
    
    private function handleGetMyRoleRequestAsynch():void {
      _dispatcher.dispatchEvent(new CoreEvent(EventConstants.GET_MY_ROLE_REQ));
    }
    
    private function handleJoinVoiceRequest():void {
      _dispatcher.dispatchEvent(new AudioSelectionWindowEvent(AudioSelectionWindowEvent.SHOW_AUDIO_SELECTION));
    }
    
    private function handleLeaveVoiceRequest():void {
      var leaveEvent:BBBEvent = new BBBEvent("LEAVE_VOICE_CONFERENCE_EVENT");
      leaveEvent.payload["userRequested"] = true;
      _dispatcher.dispatchEvent(leaveEvent);
    }
    
    private function onShareVideoCamera(publishInClient:Boolean=true):void {
      var event:ShareCameraRequestEvent = new ShareCameraRequestEvent();
      event.publishInClient = publishInClient;
      
      _dispatcher.dispatchEvent(event);
    }
    
    private function handleWebRTCCallStarted(inEchoTest:Boolean):void {
      if (inEchoTest) {
        _dispatcher.dispatchEvent(new WebRTCEchoTestEvent(WebRTCEchoTestEvent.WEBRTC_ECHO_TEST_STARTED));
      } else {
        _dispatcher.dispatchEvent(new WebRTCCallEvent(WebRTCCallEvent.WEBRTC_CALL_STARTED));
      }
    }
    
    private function handleWebRTCCallConnecting(inEchoTest:Boolean):void {
      if (inEchoTest) {
        _dispatcher.dispatchEvent(new WebRTCEchoTestEvent(WebRTCEchoTestEvent.WEBRTC_ECHO_TEST_CONNECTING));
      } else {
        _dispatcher.dispatchEvent(new WebRTCCallEvent(WebRTCCallEvent.WEBRTC_CALL_CONNECTING));
      }
    }
    
    private function handleWebRTCCallEnded(inEchoTest:Boolean):void {
      if (inEchoTest) {
        _dispatcher.dispatchEvent(new WebRTCEchoTestEvent(WebRTCEchoTestEvent.WEBRTC_ECHO_TEST_ENDED));
      } else {
        _dispatcher.dispatchEvent(new WebRTCCallEvent(WebRTCCallEvent.WEBRTC_CALL_ENDED));
      }
    }
    
    private function handleWebRTCCallFailed(inEchoTest:Boolean, errorCode:Number, cause:String):void {
      if (inEchoTest) {
        _dispatcher.dispatchEvent(new WebRTCEchoTestEvent(WebRTCEchoTestEvent.WEBRTC_ECHO_TEST_FAILED, errorCode, cause));
      } else {
        _dispatcher.dispatchEvent(new WebRTCCallEvent(WebRTCCallEvent.WEBRTC_CALL_FAILED, errorCode, cause));
      }
    }
    
    private function handleWebRTCCallWaitingForICE(inEchoTest:Boolean):void {
      if (inEchoTest) {
        _dispatcher.dispatchEvent(new WebRTCEchoTestEvent(WebRTCEchoTestEvent.WEBRTC_ECHO_TEST_WAITING_FOR_ICE));
      } else {
        _dispatcher.dispatchEvent(new WebRTCCallEvent(WebRTCCallEvent.WEBRTC_CALL_WAITING_FOR_ICE));
      }
    }
    
    private function handleWebRTCCallTransferring(inEchoTest:Boolean):void {
      if (inEchoTest) {
        _dispatcher.dispatchEvent(new WebRTCEchoTestEvent(WebRTCEchoTestEvent.WEBRTC_ECHO_TEST_TRANSFERRING));
      }
    }
    
    private function handleWebRTCMediaRequest():void {
      _dispatcher.dispatchEvent(new WebRTCMediaEvent(WebRTCMediaEvent.WEBRTC_MEDIA_REQUEST));
    }
    
    private function handleWebRTCMediaSuccess():void {
      _dispatcher.dispatchEvent(new WebRTCMediaEvent(WebRTCMediaEvent.WEBRTC_MEDIA_SUCCESS));
	}

    private function handleWebRTCMediaFail():void {
      _dispatcher.dispatchEvent(new WebRTCMediaEvent(WebRTCMediaEvent.WEBRTC_MEDIA_FAIL));
    }

    private function handleWebRTCMonitorUpdate(results:String):void {
      var e:BBBEvent = new BBBEvent(BBBEvent.WEBRTC_MONITOR_UPDATE_EVENT);
      e.payload.results = results;
      _dispatcher.dispatchEvent(e);
    }
  }
}

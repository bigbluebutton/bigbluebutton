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
package org.bigbluebutton.modules.users.services
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.utils.setTimeout;
  
  import mx.collections.ArrayCollection;
  import mx.controls.Alert;
  import mx.utils.ObjectUtil;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.EventConstants;
  import org.bigbluebutton.core.PopUpUtil;
  import org.bigbluebutton.core.TimerUtil;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.events.BreakoutRoomsUsersListUpdatedEvent;
  import org.bigbluebutton.core.events.CoreEvent;
  import org.bigbluebutton.core.events.GuestWaitingApprovedEvent;
  import org.bigbluebutton.core.events.MeetingTimeRemainingEvent;
  import org.bigbluebutton.core.events.NewGuestWaitingEvent;
  import org.bigbluebutton.core.events.UpdateRecordingTimerEvent;
  import org.bigbluebutton.core.events.UserEmojiChangedEvent;
  import org.bigbluebutton.core.events.UserStatusChangedEvent;
  import org.bigbluebutton.core.model.LiveMeeting;
  import org.bigbluebutton.core.model.MediaStream;
  import org.bigbluebutton.core.model.users.GuestWaiting;
  import org.bigbluebutton.core.model.users.User2x;
  import org.bigbluebutton.core.model.users.VoiceUser2x;
  import org.bigbluebutton.core.vo.LockSettingsVO;
  import org.bigbluebutton.main.events.BBBEvent;
  import org.bigbluebutton.main.events.BreakoutRoomEvent;
  import org.bigbluebutton.main.events.LogoutEvent;
  import org.bigbluebutton.main.events.MadePresenterEvent;
  import org.bigbluebutton.main.events.SwitchedPresenterEvent;
  import org.bigbluebutton.main.events.UserJoinedEvent;
  import org.bigbluebutton.main.events.UserLeftEvent;
  import org.bigbluebutton.main.model.users.BreakoutRoom;
  import org.bigbluebutton.main.model.users.IMessageListener;
  import org.bigbluebutton.main.model.users.events.ChangeMyRole;
  import org.bigbluebutton.main.model.users.events.ConnectionFailedEvent;
  import org.bigbluebutton.main.model.users.events.LookUpUserResultEvent;
  import org.bigbluebutton.main.model.users.events.StreamStartedEvent;
  import org.bigbluebutton.main.model.users.events.StreamStoppedEvent;
  import org.bigbluebutton.modules.phone.events.AudioSelectionWindowEvent;
  import org.bigbluebutton.modules.screenshare.events.WebRTCViewStreamEvent;
  import org.bigbluebutton.modules.users.events.MeetingMutedEvent;
  import org.bigbluebutton.util.i18n.ResourceUtil;
  
  public class MessageReceiver implements IMessageListener
  {
    private static const LOGGER:ILogger = getClassLogger(MessageReceiver);
    
    private var dispatcher:Dispatcher;
    
    public var onAllowedToJoin:Function = null;
    private static var globalDispatcher:Dispatcher = new Dispatcher();

    private static var flashWebcamPattern:RegExp = /^([A-z0-9]+)-([A-z0-9]+)-([A-z0-9]+)(-recorded)?$/;
    
    public function MessageReceiver() {
      BBB.initConnectionManager().addMessageListener(this);
      this.dispatcher = new Dispatcher();
    }
    
    public function onMessage(messageName:String, message:Object):void {
      //LOGGER.debug(" received message " + messageName);
      
      switch (messageName) {
        case "GetUsersMeetingRespMsg":
          handleGetUsersMeetingRespMsg(message);
          break;
        case "GetVoiceUsersMeetingRespMsg":
          handleGetVoiceUsersMeetingRespMsg(message);
          break;
        case "GetWebcamStreamsMeetingRespMsg":
          handleGetWebcamStreamsMeetingRespMsg(message);
          break;
        case "UserJoinedMeetingEvtMsg":
          handleUserJoinedMeetingEvtMsg(message);
          break;
        case "UserLeftMeetingEvtMsg":
          handleUserLeftMeetingEvtMsg(message);
          break;
        case "PresenterAssignedEvtMsg":
          handleAssignPresenterCallback(message);
          break;
        case "PresenterUnassignedEvtMsg":
          handleUnassignPresenterCallback(message);
          break;
        case "UserBroadcastCamStartedEvtMsg": 
          handleUserBroadcastCamStartedEvtMsg(message);
          break;
        case "UserBroadcastCamStoppedEvtMsg": 
          handleUserBroadcastCamStoppedEvtMsg(message);
          break;  
        case "UserJoinedVoiceConfToClientEvtMsg":
          handleUserJoinedVoiceConfToClientEvtMsg(message);
          break;
        case "UserLeftVoiceConfToClientEvtMsg":
          handleUserLeftVoiceConfToClientEvtMsg(message);
          break;
        case "UserTalkingVoiceEvtMsg":
          handleUserTalkingEvtMsg(message);
          break;
        case "UserMutedVoiceEvtMsg":
          handleUserMutedEvtMsg(message);
          break;
        case "GuestsWaitingForApprovalEvtMsg":
          handleGuestsWaitingForApprovalEvtMsg(message);
          break;
        case "MeetingEndingEvtMsg":
          handleMeetingEnding(message);
          break;
        case "MeetingMutedEvtMsg":
          handleMeetingMuted(message);
          break;
        case "IsMeetingMutedRespMsg":
          handleIsMeetingMutedResp(message);
          break;
        case "MeetingInactivityWarningEvtMsg":
          handleInactivityWarning(message);
          break;
        case "MeetingIsActiveEvtMsg":
          handleMeetingIsActive(message);
          break;
        case "UserEmojiChangedEvtMsg":
          handleEmojiStatusHand(message);
          break;
        case "LookUpUserRespMsg":
          handleLookUpUserRespMsg(message);
          break;
		case "UpdateRecordingTimerEvtMsg":
		  handleUpdateRecordingTimer(message);
		  break;
        case "GetRecordingStatusRespMsg":
          handleGetRecordingStatusReply(message);
          break;
		case "GetWebcamsOnlyForModeratorRespMsg":
		  handleGetWebcamsOnlyForModeratorRespMsg(message);
		  break;
        case "RecordingStatusChangedEvtMsg":
          handleRecordingStatusChanged(message);
          break;
		case "WebcamsOnlyForModeratorChangedEvtMsg":
			handleWebcamsOnlyForModeratorChanged(message);
			break;
        case "LockSettingsInMeetingChangedEvtMsg":
          handlePermissionsSettingsChanged(message);
          break;
        case "UserLockedInMeetingEvtMsg":
          handleUserLocked(message);
          break;
        case "GetLockSettingsRespMsg":
          handleGetLockSettings(message);
          break;
        case "LockSettingsNotInitializedRespMsg":
          handleLockSettingsNotInitialized(message);
          break;
        // Breakout room feature
        case "BreakoutRoomsListEvtMsg":
          handleBreakoutRoomsList(message)
          break;
        case "BreakoutRoomJoinURLEvtMsg":
          handleBreakoutRoomJoinURL(message);
          break;
        case "UpdateBreakoutUsersEvtMsg":
          handleUpdateBreakoutUsers(message);
          break;
        case "MeetingTimeRemainingUpdateEvtMsg":
          handleMeetingTimeRemainingUpdateEvtMsg(message);
          break;
        case "BreakoutRoomsTimeRemainingUpdateEvtMsg":
          handleBreakoutRoomsTimeRemainingUpdate(message);
          break;
        case "BreakoutRoomStartedEvtMsg":
          handleBreakoutRoomStarted(message);
          break;
        case "BreakoutRoomEndedEvtMsg":
          handleBreakoutRoomClosed(message);
          break;
        case "UserEjectedFromMeetingEvtMsg":
          handleUserEjectedFromMeeting(message);
          break;
        case "ScreenshareRtmpBroadcastStartedEvtMsg":
          handleScreenshareRtmpBroadcastStartedEvtMsg(message);
          break;
        case "ScreenshareRtmpBroadcastStoppedEvtMsg":
          handleScreenshareRtmpBroadcastStoppedEvtMsg(message);
          break;
        case "GetGuestPolicyRespMsg":
          handleGetGuestPolicyReply(message);
          break;
        case "GuestPolicyChangedEvtMsg":
          handleGuestPolicyChanged(message);
          break;
        case "UserRoleChangedEvtMsg":
          handleUserRoleChangedEvtMsg(message);
          break;
        case "GuestsWaitingApprovedEvtMsg":
          handleGuestsWaitingApprovedEvtMsg(message);
          break;
        case "GetGuestsWaitingApprovalRespMsg":
          handleGetGuestsWaitingApprovalRespMsg(message);
          break;
		case "UserInactivityInspectMsg":
		  handleUserInactivityInspectMsg(message);
		  break;
      }
    }
    
		private function handleUserInactivityInspectMsg(msg: Object):void {
			var header: Object = msg.header as Object;
			var body: Object = msg.body as Object;
			
			var bbbEvent:BBBEvent = new BBBEvent(BBBEvent.USER_INACTIVITY_INSPECT_EVENT);    
			bbbEvent.payload.responseDelay = body.responseDelay as Number;
			globalDispatcher.dispatchEvent(bbbEvent);
		}
		
    private function handleUserJoinedVoiceConfToClientEvtMsg(msg: Object): void {
      var header: Object = msg.header as Object;
      var body: Object = msg.body as Object;
      processVoiceUserJoinedEvent(body);
    }
    
    private function processVoiceUserJoinedEvent(vuser:Object):void {
      var vu: VoiceUser2x = new VoiceUser2x();
      vu.intId = vuser.intId as String;
      vu.voiceUserId = vuser.voiceUserId as String;
      vu.callerName = vuser.callerName as String;
      vu.callerNum = vuser.callerNum as String;
      vu.muted = vuser.muted as Boolean;
      vu.talking = vuser.talking as Boolean;
      vu.callingWith = vuser.callingWith as String;
      vu.listenOnly = vuser.listenOnly as Boolean;
      
      LiveMeeting.inst().voiceUsers.add(vu);
      
      if (UsersUtil.isMe(vu.intId)) {
        LiveMeeting.inst().me.muted = vu.muted;
        LiveMeeting.inst().me.inVoiceConf = true;
        //Toaster.toast(ResourceUtil.getInstance().getString("bbb.notification.audio.joined"), ToastType.INFO, ToastIcon.AUDIO);
      }
      
      var bbbEvent:BBBEvent = new BBBEvent(BBBEvent.USER_VOICE_JOINED);
      bbbEvent.payload.userID = vu.intId;            
      globalDispatcher.dispatchEvent(bbbEvent);
    }
    
    private function processVoiceUserLeftEvent(intId:String):void {
      LiveMeeting.inst().voiceUsers.remove(intId);
      
      if (UsersUtil.isMe(intId)) {
        LiveMeeting.inst().me.muted = false;
        LiveMeeting.inst().me.inVoiceConf = false;
        //Toaster.toast(ResourceUtil.getInstance().getString("bbb.notification.audio.left"), ToastType.INFO, ToastIcon.AUDIO);
      }
      
      var bbbEvent:BBBEvent = new BBBEvent(BBBEvent.USER_VOICE_LEFT);
      bbbEvent.payload.userID = intId;
      globalDispatcher.dispatchEvent(bbbEvent);
    }
    private function handleUserLeftVoiceConfToClientEvtMsg(msg: Object):void {
      var header: Object = msg.header as Object;
      var body: Object = msg.body as Object;
      var intId: String = body.intId as String;
      processVoiceUserLeftEvent(intId);
    }
    
    private function handleUserMutedEvtMsg(msg: Object): void {
      var header: Object = msg.header as Object;
      var body: Object = msg.body as Object;
      var intId: String = body.intId as String;
      var muted: Boolean = body.muted as Boolean;
      
      LiveMeeting.inst().voiceUsers.setMutedForUser(intId, muted);
      
      if (UsersUtil.isMe(intId)) {
        LiveMeeting.inst().me.muted = muted;
      }
      
      var bbbEvent:BBBEvent = new BBBEvent(BBBEvent.USER_VOICE_MUTED);
      bbbEvent.payload.muted = muted;
      bbbEvent.payload.userID = intId;
      globalDispatcher.dispatchEvent(bbbEvent);   
    }
    
    private function handleUserTalkingEvtMsg(msg: Object): void {
      var header: Object = msg.header as Object;
      var body: Object = msg.body as Object;
      var intId: String = body.intId as String;
      var talking: Boolean = body.talking as Boolean;
      
      LiveMeeting.inst().voiceUsers.setTalkingForUser(intId, talking);
      
      var event:CoreEvent = new CoreEvent(EventConstants.USER_TALKING);
      event.message.userID = intId;
      event.message.talking = talking;
      globalDispatcher.dispatchEvent(event); 
    }
    
    private function processGuestWaitingForApproval(guest: Object): void {
      var guestWaiting: GuestWaiting = new GuestWaiting(guest.intId, 
                                                        guest.name, 
                                                        guest.role,
                                                        guest.guest as Boolean,
                                                        guest.authenticated as Boolean);

      // do not add self
      if (UsersUtil.getMyUserID() != guest.intId) {
        LiveMeeting.inst().guestsWaiting.add(guestWaiting);
      }
    }
    
    private function handleGuestsWaitingForApprovalEvtMsg(msg: Object): void {
      var body: Object = msg.body as Object;
      var guests: Array = body.guests as Array;
      
      for (var i: int = 0; i < guests.length; i++) {
        var guest: Object = guests[i] as Object;
        processGuestWaitingForApproval(guest);
      }
      
      var guestsWaitingEvent:NewGuestWaitingEvent = new NewGuestWaitingEvent();
      dispatcher.dispatchEvent(guestsWaitingEvent);	
      
    }
    
    private function removeGuestWaiting(userId: String): void {
      LiveMeeting.inst().guestsWaiting.remove(userId);
    }
    
    private function handleGuestsWaitingApprovedEvtMsg(msg: Object): void {
      var body: Object = msg.body as Object;
      var guests: Array = body.guests as Array;
      
      for (var i: int = 0; i < guests.length; i++) {
        var guest: Object = guests[i] as Object;
        removeGuestWaiting(guest.guest as String);
      }
      
      var guestsWaitingEvent:GuestWaitingApprovedEvent = 
        new GuestWaitingApprovedEvent(body.approvedBy as String);
      dispatcher.dispatchEvent(guestsWaitingEvent);	
    }

    private function handleGetGuestsWaitingApprovalRespMsg(msg: Object): void {
      var body: Object = msg.body as Object;
      var guests: Array = body.guests as Array;

      for (var i: int = 0; i < guests.length; i++) {
        var guest: Object = guests[i] as Object;
        processGuestWaitingForApproval(guest);
      }

      // do not display notification for self
      if (guests.length == 0 || (guests.length == 1 && guests[0].intId == UsersUtil.getMyUserID())) {
        return;
      }
      var guestsWaitingEvent:NewGuestWaitingEvent = new NewGuestWaitingEvent();
      dispatcher.dispatchEvent(guestsWaitingEvent);
    }
    
    private function findUserInNewUsers(userId: String, newUsers:Array):Object {
      for (var i:int = 0; i < newUsers.length; i++) {
        var user:Object = newUsers[i] as Object;
        var intId: String = user.intId as String;
        if (userId == intId) return newUsers.removeAt(i);
      } 
      return null;
    }
    
    private function handleGetUsersMeetingRespMsg(msg: Object):void {
      var body: Object = msg.body as Object
      var newUsers: Array = body.users as Array;

      var oldUsers:Array = UsersUtil.getUsers().toArray();
      
      for (var i:int = 0; i < oldUsers.length; i++) {
        var user:User2x = oldUsers[i] as User2x;
        var newUser:Object = findUserInNewUsers(user.intId, newUsers);
        if (newUser != null) {
          // The user is in both old users and new users.
          // Just need to update this user with the new state.
          processUserJoinedMeetingMsg(newUser);
        } else {
          // The user is in the old users but not in the new one.
          // The user probably has left the meeting. Remove the user.
          injectUserLeftEvent(user.intId);
        }
      } 
      
      if (newUsers.length > 0) {
        // There are remaining new users that were not in the old users list.
        // We need to join them into the users list.
        for (var k:int = 0; k < newUsers.length; k++) {
          var newUserK:Object = newUsers[k] as Object;
          processUserJoinedMeetingMsg(newUserK);
        }
      }
      
    }
    
    private function injectUserLeftEvent(userId:String):void {
      var webUser:User2x = UsersUtil.getUser(userId);
      
      if (webUser != null) {
        LiveMeeting.inst().users.remove(userId);
        if(webUser.waitingForAcceptance) {
          var removeGuest:BBBEvent = new BBBEvent(BBBEvent.REMOVE_GUEST_FROM_LIST);
          removeGuest.payload.userId = userId;
          dispatcher.dispatchEvent(removeGuest);
        }
        
        var joinEvent:UserLeftEvent = new UserLeftEvent(UserLeftEvent.LEFT);
        joinEvent.userID = userId;
        dispatcher.dispatchEvent(joinEvent);	
      }
    }
    
    public function handleUserLeftMeetingEvtMsg(msg:Object):void {     
      var body: Object = msg.body as Object
      var userId: String = body.intId as String;
      injectUserLeftEvent(userId);
    }
    
    private function handleUserJoinedMeetingEvtMsg(msg:Object):void {
      var body: Object = msg.body as Object;
      processUserJoinedMeetingMsg(body);
    }
    
    private function processUserJoinedMeetingMsg(user:Object):void {
      var intId: String = user.intId as String;
      var extId: String = user.extId as String;
      var name: String = user.name as String;
      var role: String = user.role as String;
      var guest: Boolean = user.guest as Boolean;
      var authed: Boolean = user.authed as Boolean;
      var waitingForAcceptance: Boolean = user.waitingForAcceptance as Boolean;
      var emoji: String = user.emoji as String;
      var locked: Boolean = user.locked as Boolean;
      var presenter: Boolean = user.presenter as Boolean;
      var avatar: String = user.avatar as String;
      // var clientType: String = user.clientType as String;

      var user2x: User2x = new User2x();
      user2x.intId = intId;
      user2x.extId = extId;
      user2x.name = name;
      user2x.role = role;
      user2x.guest = guest;
      user2x.authed = authed;
      user2x.waitingForAcceptance = waitingForAcceptance;
      user2x.emoji = emoji;
      user2x.locked = locked;
      user2x.presenter = presenter;
      user2x.avatar = avatar;
      
      var oldUser: User2x = LiveMeeting.inst().users.getUser(intId);
      var wasPresenterBefore: Boolean = false;
      if (oldUser != null && oldUser.presenter) {
        wasPresenterBefore = true;
      }

      // remove remaining instance of the user before adding
      LiveMeeting.inst().users.remove(intId);
      LiveMeeting.inst().users.add(user2x);

      var joinEvent:UserJoinedEvent = new UserJoinedEvent(UserJoinedEvent.JOINED);
      joinEvent.userID = user2x.intId;
      dispatcher.dispatchEvent(joinEvent);

      if (UsersUtil.isMe(intId)) {
        if (wasPresenterBefore != presenter) {
          UsersUtil.setUserAsPresent(intId, false);
          sendSwitchedPresenterEvent(false, intId);

          var e:MadePresenterEvent = new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_VIEWER_MODE);
          e.userID = intId;
          e.presenterName = name;
          e.assignedBy = intId;
          dispatcher.dispatchEvent(e);
          dispatcher.dispatchEvent(new UserStatusChangedEvent(intId));
        }
        
        LiveMeeting.inst().me.locked = locked;
        UsersUtil.applyLockSettings();
      }

    }
    
    private function findVoiceUserInNewVoiceUsers(userId: String, newVoiceUsers:Array):Object {
      for (var i:int = 0; i < newVoiceUsers.length; i++) {
        var user:Object = newVoiceUsers[i] as Object;
        var intId: String = user.intId as String;
        if (userId == intId) return newVoiceUsers.removeAt(i);
      } 
      return null;
    }
    
    private function handleGetVoiceUsersMeetingRespMsg(msg:Object):void {
      var body: Object = msg.body as Object;
      var newVoiceUsers: Array = body.users as Array;
      
      var oldVoiceUsers:Array = LiveMeeting.inst().voiceUsers.getVoiceUsers().toArray();
      
      for (var i:int = 0; i < oldVoiceUsers.length; i++) {
        var user:VoiceUser2x = oldVoiceUsers[i] as VoiceUser2x;
        var newVoiceUser:Object = findVoiceUserInNewVoiceUsers(user.intId, newVoiceUsers);
        if (newVoiceUser != null) {
          // The user is in both old users and new users.
          // Just need to update this user with the new state.
          processAddVoiceUser(newVoiceUser);
        } else {
          // The user is in the old users but not in the new one.
          // The user probably has left the meeting. Remove the user.
          processVoiceUserLeftEvent(user.intId);
        }
      } 
      
      if (newVoiceUsers.length > 0) {
        // There are remaining new users that were not in the old users list.
        // We need to join them into the users list.
        for (var k:int = 0; k < newVoiceUsers.length; k++) {
          var newUserK:Object = newVoiceUsers[k] as Object;
          processAddVoiceUser(newUserK);
        }
      }
      
    }
    
    private function processAddVoiceUser(user:Object):void {

      var intId: String = user.intId as String;
      var voiceUserId: String = user.voiceUserId as String;
      var callingWith: String = user.callingWith as String;
      var callerName: String = user.callerName as String;
      var callerNum: String = user.callerNum as String;
      var muted: Boolean = user.muted as Boolean;
      var talking: Boolean = user.talking as Boolean;
      var listenOnly: Boolean = user.listenOnly as Boolean;
      
      var vu: VoiceUser2x = new VoiceUser2x();
      vu.intId = intId;
      vu.voiceUserId = voiceUserId;
      vu.callingWith = callingWith;
      vu.callerName = callerName;
      vu.callerNum = callerNum;
      vu.muted = muted;
      vu.talking = talking;
      vu.listenOnly = listenOnly;
      
      LiveMeeting.inst().voiceUsers.add(vu);      
    }
    
    private function handleGetWebcamStreamsMeetingRespMsg(msg:Object):void {
      var body: Object = msg.body as Object
      var streams: Array = body.streams as Array;
      
      for (var i:int = 0; i < streams.length; i++) {
        var stream:Object = streams[i] as Object;
        var streamId: String = stream.streamId as String;
        var media: Object = stream.stream as Object;
        var url: String = media.url as String;
        var userId: String = media.userId as String;
        var attributes: Object = media.attributes as Object;
        var viewers: Array = media.viewers as Array;


        if (isValidFlashWebcamStream(streamId)) {
          var webcamStream: MediaStream = new MediaStream(streamId, userId);
          webcamStream.streamId = streamId;
          webcamStream.userId = userId;
          webcamStream.attributes = attributes;
          webcamStream.viewers = viewers;

          LiveMeeting.inst().webcams.add(webcamStream);
        }
      }
    }
    
    
    private function handleScreenshareRtmpBroadcastStartedEvtMsg(msg:Object):void {
      var body: Object = msg.body as Object
      var stream: String = body.stream as String;
      var vidWidth: Number = body.vidWidth as Number;
      var vidHeight: Number = body.vidHeight as Number;
			
			var logData:Object = UsersUtil.initLogData();
			logData.tags = ["webrtc-screenshare"];
			logData.logCode = "screenshare-rtmp-broadcast-started";
			logData.stream = stream;
			LOGGER.info(JSON.stringify(logData));
      
      var event:WebRTCViewStreamEvent = new WebRTCViewStreamEvent(WebRTCViewStreamEvent.START);
      
      event.videoWidth = vidWidth;
      event.videoHeight = vidHeight;
      event.rtmp = stream;
      
      dispatcher.dispatchEvent(event);
    }
    
    private function handleScreenshareRtmpBroadcastStoppedEvtMsg(msg:Object):void {
      var body: Object = msg.body as Object
      var stream: String = body.stream as String;
      var vidWidth: Number = body.vidWidth as Number;
      var vidHeight: Number = body.vidHeight as Number;
      
			var logData:Object = UsersUtil.initLogData();
			logData.tags = ["webrtc-screenshare"];
			logData.logCode = "screenshare-rtmp-broadcast-stopped";
			logData.stream = stream;
			LOGGER.info(JSON.stringify(logData));
			
      var event:WebRTCViewStreamEvent = new WebRTCViewStreamEvent(WebRTCViewStreamEvent.STOP);
      
      event.videoWidth = vidWidth;
      event.videoHeight = vidHeight;
      event.rtmp = stream;
      
      dispatcher.dispatchEvent(event);
    }
    
    private function handleUserEjectedFromMeeting(msg: Object):void {
      var body: Object = msg.body as Object;
      var userId:String = body.userId as String;
      var reasonCode: String = body.reasonCode as String;
      
      UsersUtil.setUserEjected(reasonCode);
      
      var logData:Object = UsersUtil.initLogData();
      logData.tags = ["users"];
      logData.logCode = "received_user_ejected";
			logData.userId = userId;
      LOGGER.debug(JSON.stringify(logData));
			
			// Let the logout happen when receiving the user ejected message instead
			// of when the connection is closed in NetConnectionDelegate. 
			// Firefox and IE isn't closing the connection when using RTMPS
			// which doesn't trigger this event. (ralam july 17, 2018)			
			var reason:String = ConnectionFailedEvent.USER_EJECTED_FROM_MEETING;
			var cfe:ConnectionFailedEvent = new ConnectionFailedEvent(reason);
			dispatcher.dispatchEvent(cfe);
    }
    
    private function handleUserLocked(msg:Object):void {
      var body:Object = msg.body as Object;
      var userId: String = body.userId as String;
      var locked: Boolean = body.locked as Boolean;
      var user:User2x = UsersUtil.getUser(userId);
      
      if(user.locked != locked) {
        if (UsersUtil.isMe(user.intId)) {
          LiveMeeting.inst().me.locked = locked;
          
          UsersUtil.applyLockSettings();
        }
        
        user.locked = locked;
        
        dispatcher.dispatchEvent(new UserStatusChangedEvent(user.intId));
      }
      
      return;
    }
    
    private function handlePermissionsSettingsChanged(msg:Object):void {
      var body:Object = msg.body as Object;
      
      var lockSettings:LockSettingsVO = new LockSettingsVO(
        body.disableCam as Boolean,
        body.disableMic as Boolean,
        body.disablePrivChat as Boolean,
        body.disablePubChat as Boolean,
        body.disableNote as Boolean,
        body.lockedLayout as Boolean,
        body.hideUserList as Boolean,
        body.lockOnJoin as Boolean,
        body.lockOnJoinConfigurable as Boolean);
      UsersUtil.setLockSettings(lockSettings);
    }
    
    private function handleGetLockSettings(msg:Object):void {
   
      var body:Object = msg.body as Object;
      
      var lockSettings:LockSettingsVO = new LockSettingsVO(
        body.disableCam as Boolean,
        body.disableMic as Boolean,
        body.disablePrivChat as Boolean,
        body.disablePubChat as Boolean,
        body.disableNote as Boolean,
        body.lockedLayout as Boolean,
        body.hideUserList as Boolean,
        body.lockOnJoin as Boolean,
        body.lockOnJoinConfigurable as Boolean);
      UsersUtil.setLockSettings(lockSettings);
    }
    
	private function handleLockSettingsNotInitialized(msg:Object):void {
		UsersUtil.lockSettingsNotInitialized();
	}
	
    private function sendRecordingStatusUpdate(recording:Boolean):void {
      LiveMeeting.inst().meetingStatus.isRecording = recording;
      
      var e:BBBEvent = new BBBEvent(BBBEvent.CHANGE_RECORDING_STATUS);
      e.payload.remote = true;
      e.payload.recording = recording;
	  
      dispatcher.dispatchEvent(e);
    }
	
    private function sendWebcamsOnlyForModeratorChanged(webcamsOnlyForModerator:Boolean):void {
		LiveMeeting.inst().meeting.webcamsOnlyForModerator = webcamsOnlyForModerator;
		
		var e:BBBEvent = new BBBEvent(BBBEvent.CHANGE_WEBCAMS_ONLY_FOR_MODERATOR);
		e.payload.webcamsOnlyForModerator = webcamsOnlyForModerator;
		
		dispatcher.dispatchEvent(e);
	}
    
    private function handleMeetingMuted(msg:Object):void {
      var body:Object = msg.body as Object;
      if (body.hasOwnProperty("muted")) {
        LiveMeeting.inst().meetingStatus.isMeetingMuted = body.muted as Boolean;
        dispatcher.dispatchEvent(new MeetingMutedEvent());
      }
    }
    
    private function handleIsMeetingMutedResp(msg:Object):void {
      var body:Object = msg.body as Object;
      if (body.hasOwnProperty("muted")) {
        LiveMeeting.inst().meetingStatus.isMeetingMuted = body.muted as Boolean;
        dispatcher.dispatchEvent(new MeetingMutedEvent());
      }
    }
    
    private function handleInactivityWarning(msg:Object):void {
      var body:Object = msg.body as Object;
      
      var bbbEvent:BBBEvent = new BBBEvent(BBBEvent.INACTIVITY_WARNING_EVENT);
      bbbEvent.payload.duration = body.timeLeftInSec as Number;
      globalDispatcher.dispatchEvent(bbbEvent);
    }
    
    private function handleMeetingIsActive(msg:Object):void {
      var bbbEvent:BBBEvent = new BBBEvent(BBBEvent.MEETING_IS_ACTIVE_EVENT);
      globalDispatcher.dispatchEvent(bbbEvent);
    }
    
    private function handleGetRecordingStatusReply(msg: Object):void {     
      var body:Object = msg.body as Object;
      var recording: Boolean = body.recording as Boolean;
      
      sendRecordingStatusUpdate(recording);      
    }
	
	private function handleGetWebcamsOnlyForModeratorRespMsg(msg:Object):void {
		var body:Object = msg.body as Object;
		var webcamsOnlyForModerator: Boolean = body.webcamsOnlyForModerator as Boolean;
		
		LiveMeeting.inst().meeting.webcamsOnlyForModerator = webcamsOnlyForModerator;
	}
    
    private function handleRecordingStatusChanged(msg: Object):void {    
      var body:Object = msg.body as Object;
      var recording: Boolean = body.recording as Boolean;
      sendRecordingStatusUpdate(recording);
    }
	
	private function handleWebcamsOnlyForModeratorChanged(msg: Object):void {
		var body:Object = msg.body as Object;
		var webcamsOnlyForModerator: Boolean = body.webcamsOnlyForModerator as Boolean;
		sendWebcamsOnlyForModeratorChanged(webcamsOnlyForModerator);
	}

    /**
     * This meeting is in the process of ending by the server
     */
    public function handleMeetingEnding(msg:Object):void {
      // Avoid trying to reconnect
      var cancelReconnectEvent:BBBEvent = new BBBEvent(BBBEvent.CANCEL_RECONNECTION_EVENT);
      dispatcher.dispatchEvent(cancelReconnectEvent);
      var endMeetingEvent:BBBEvent = new BBBEvent(BBBEvent.END_MEETING_EVENT);
      dispatcher.dispatchEvent(endMeetingEvent);
    }
    
    public function handleAssignPresenterCallback(msg:Object):void {     
      var body: Object = msg.body as Object;
      
      var newPresenterID:String = body.presenterId as String;
      var newPresenterName:String = body.presenterName as String;
      var assignedBy:String = body.assignedBy as String;
      
      UsersUtil.setUserAsPresent(newPresenterID, true);
      sendSwitchedPresenterEvent(true, newPresenterID);
      
      if (UsersUtil.getMyUserID() == newPresenterID) {
        var e:MadePresenterEvent = new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_PRESENTER_MODE);
        e.userID = newPresenterID;
        e.presenterName = newPresenterName;
        e.assignedBy = assignedBy;
        dispatcher.dispatchEvent(e);
      }
      
      dispatcher.dispatchEvent(new UserStatusChangedEvent(newPresenterID));
    }
    
    public function handleUnassignPresenterCallback(msg:Object):void {
      var body: Object = msg.body as Object;
      
      var oldPresenterID:String = body.intId as String;
      var oldPresenterName:String = body.name as String;
      var assignedBy:String = body.assignedBy as String;
      
      UsersUtil.setUserAsPresent(oldPresenterID, false);
      sendSwitchedPresenterEvent(false, oldPresenterID);
      
      if (UsersUtil.getMyUserID() == oldPresenterID) {
        var e:MadePresenterEvent = new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_VIEWER_MODE);
        e.userID = oldPresenterID;
        e.presenterName = oldPresenterName;
        e.assignedBy = assignedBy;
        dispatcher.dispatchEvent(e);
      }
      
      dispatcher.dispatchEvent(new UserStatusChangedEvent(oldPresenterID));
    }
    
    private function sendSwitchedPresenterEvent(amIPresenter:Boolean, newPresenterUserID:String):void {
      var roleEvent:SwitchedPresenterEvent = new SwitchedPresenterEvent();
      roleEvent.amIPresenter = amIPresenter;
      roleEvent.newPresenterUserID = newPresenterUserID;
      dispatcher.dispatchEvent(roleEvent);   
    }
    
    private function handleEmojiStatusHand(msg: Object): void {   
      var body:Object = msg.body as Object;      
      var userId: String = body.userId as String;
      var emoji: String = body.emoji as String;
      var webUser: User2x = UsersUtil.getUser(userId);
      if (webUser != null) {
        webUser.emoji = emoji;
        if (UsersUtil.isMe(userId)) {
          UsersUtil.setMyEmoji(emoji);
        }
        
        sendUserEmojiChangedEvent(userId, emoji);
      }
      
    }
	
	private function handleLookUpUserRespMsg(msg:Object):void {
		// This message is coming from outside so checks need to be more thorough
		var body:Object = msg.body as Object;
		if (body) {
			var userInfo:Array = body.userInfo as Array;
			if (userInfo) {
				dispatcher.dispatchEvent(new LookUpUserResultEvent(userInfo));
			}
		}
	}
	
	private function handleUpdateRecordingTimer(msg:Object):void {
		if (msg.body.time > 0) {
			TimerUtil.recordingTimeReceived = true;
		} else {
			TimerUtil.recordingTimeReceived = false;
		}
		
		var e:UpdateRecordingTimerEvent = new UpdateRecordingTimerEvent(msg.body.time);
		dispatcher.dispatchEvent(e);
	}
    
    private function sendUserEmojiChangedEvent(userId: String, emoji: String):void{
      var dispatcher:Dispatcher = new Dispatcher();
      dispatcher.dispatchEvent(new UserEmojiChangedEvent(userId, emoji));
	}

	private function handleUserBroadcastCamStartedEvtMsg(msg:Object):void {
		var userId:String = msg.body.userId as String;
		var streamId:String = msg.body.stream as String;
		var logData:Object = UsersUtil.initLogData();
		logData.tags = ["webcam"];
		logData.logCode = "user_broadcasting_camera_start";
		logData.userId = userId;
		logData.streamId = streamId;

		if (isValidFlashWebcamStream(streamId)) {

			LOGGER.info(JSON.stringify(logData));

			var mediaStream:MediaStream = new MediaStream(streamId, userId)
			LiveMeeting.inst().webcams.add(mediaStream);

			var webUser:User2x = UsersUtil.getUser(userId);
			if (webUser != null) {
				sendStreamStartedEvent(userId, webUser.name, streamId);
			}
		}
	}

	private function sendStreamStartedEvent(userId:String, name:String, stream:String):void {
		var dispatcher:Dispatcher = new Dispatcher();
		dispatcher.dispatchEvent(new StreamStartedEvent(userId, name, stream));
	}

	private function handleUserBroadcastCamStoppedEvtMsg(msg:Object):void {
		var userId:String = msg.body.userId as String;
		var stream:String = msg.body.stream as String;

		var logData:Object = UsersUtil.initLogData();
		logData.tags = ["webcam"];
		logData.logCode = "user_broadcasting_camera_stop";
		logData.userId = userId;
		logData.streamId = stream;
		LOGGER.info(JSON.stringify(logData));

		var mediaStream:MediaStream = LiveMeeting.inst().webcams.remove(stream);

		if (mediaStream != null) {
			sendStreamStoppedEvent(mediaStream.userId, stream);
		}
	}
    
    private function sendStreamStoppedEvent(userId: String, streamId: String):void{
      var dispatcher:Dispatcher = new Dispatcher();
      dispatcher.dispatchEvent(new StreamStoppedEvent(userId, streamId));
    }
    
    
    private function handleBreakoutRoomsList(msg:Object):void{
      for each(var room : Object in msg.body.rooms) {
        var breakoutRoom : BreakoutRoom = new BreakoutRoom();
        breakoutRoom.meetingId = room.breakoutId as String;
        breakoutRoom.externalMeetingId = room.externalId as String;
        breakoutRoom.name = room.name as String;
        breakoutRoom.sequence = room.sequence as Number;
		breakoutRoom.freeJoin = room.freeJoin as Boolean;
        LiveMeeting.inst().breakoutRooms.addBreakoutRoom(breakoutRoom);
      }
      LiveMeeting.inst().breakoutRooms.breakoutRoomsReady = msg.body.roomsReady as Boolean;
    }
    
    private function handleBreakoutRoomJoinURL(msg:Object):void{
      var body: Object = msg.body as Object;
      var externalId: String = body.externalId as String;
      var redirectJoinURL: String = body.redirectJoinURL as String;
      
      var breakoutRoom : BreakoutRoom = LiveMeeting.inst().breakoutRooms.getBreakoutRoomByExternalId(externalId);
      var sequence : int = breakoutRoom.sequence;
      
      var event : BreakoutRoomEvent = new BreakoutRoomEvent(BreakoutRoomEvent.BREAKOUT_JOIN_URL);
      event.joinURL = redirectJoinURL;
      event.breakoutMeetingSequence = sequence;
      dispatcher.dispatchEvent(event);
      
      // We delay assigning last room invitation sequence to be sure it is handle in time by the item renderer
      setTimeout(function() : void {LiveMeeting.inst().breakoutRooms.setLastBreakoutRoomInvitation(sequence)}, 1000);
    }
    
    private function handleUpdateBreakoutUsers(msg:Object):void{
      var body: Object = msg.body as Object;
      var breakoutId: String = body.breakoutId as String;
      var users: Array = body.users as Array;
	  
	  LiveMeeting.inst().breakoutRooms.updateUsers(breakoutId, users);
	  LiveMeeting.inst().users.updateBreakoutRooms(LiveMeeting.inst().breakoutRooms.getBreakoutRoom(breakoutId).sequence, users);

	  dispatcher.dispatchEvent(new BreakoutRoomsUsersListUpdatedEvent());
    }
    
    private function handleMeetingTimeRemainingUpdateEvtMsg(msg:Object):void {
      var e:MeetingTimeRemainingEvent = new MeetingTimeRemainingEvent(msg.body.timeLeftInSec);
      dispatcher.dispatchEvent(e);
    }
    
    private function handleBreakoutRoomsTimeRemainingUpdate(msg:Object):void {
      var e:BreakoutRoomEvent = new BreakoutRoomEvent(BreakoutRoomEvent.UPDATE_REMAINING_TIME_PARENT);
      e.durationInMinutes = msg.body.timeRemaining;
      dispatcher.dispatchEvent(e);
    }
    
    private function handleBreakoutRoomStarted(msg:Object):void{
      var breakout: Object = msg.body.breakout as Object;
      var breakoutId: String = breakout.breakoutId as String;
      var externalId: String = breakout.externalId as String;
      var name: String = breakout.name as String;
      var sequence: int = breakout.sequence as Number;
      var freeJoin: Boolean = breakout.freeJoin as Boolean;
      
      var breakoutRoom : BreakoutRoom = new BreakoutRoom();
      breakoutRoom.meetingId = breakoutId;
      breakoutRoom.externalMeetingId = externalId;
      breakoutRoom.name = name;
      breakoutRoom.sequence = sequence;
      breakoutRoom.freeJoin = freeJoin;
      LiveMeeting.inst().breakoutRooms.addBreakoutRoom(breakoutRoom);
    }
    
    private function handleBreakoutRoomClosed(msg:Object):void{
      var body: Object = msg.body as Object;
      var breakoutId: String = body.breakoutId as String;
      
	  // Display audio join window
	  if (LiveMeeting.inst().me.breakoutEjectFromAudio &&
		  LiveMeeting.inst().breakoutRooms.getBreakoutRoom(breakoutId).hasUserWithId(LiveMeeting.inst().me.id) &&
		  !LiveMeeting.inst().me.inVoiceConf
	  ) {
	  	  LiveMeeting.inst().me.breakoutEjectFromAudio = false;
		  dispatcher.dispatchEvent(new AudioSelectionWindowEvent(AudioSelectionWindowEvent.SHOW_AUDIO_SELECTION));
	  }
	  
      switchUserFromBreakoutToMainVoiceConf(breakoutId);
      var breakoutRoom: BreakoutRoom = LiveMeeting.inst().breakoutRooms.getBreakoutRoom(breakoutId);
      LiveMeeting.inst().breakoutRooms.removeBreakoutRoom(breakoutId);
	  LiveMeeting.inst().users.removeBreakoutRoomFromUsers(breakoutRoom.sequence);
	  
	  dispatcher.dispatchEvent(new BreakoutRoomsUsersListUpdatedEvent());
    }
    
    private function switchUserFromBreakoutToMainVoiceConf(breakoutId: String): void {
      // We need to switch the use back to the main audio confrence if he is in a breakout audio conference
      if (LiveMeeting.inst().breakoutRooms.isListeningToBreakoutRoom(breakoutId)) {
        var dispatcher:Dispatcher = new Dispatcher();
        var e:BreakoutRoomEvent = new BreakoutRoomEvent(BreakoutRoomEvent.LISTEN_IN);
        e.breakoutMeetingId = breakoutId;
        e.listen = false;
        dispatcher.dispatchEvent(e);
      }
    }
    
    private function isValidFlashWebcamStream(streamId: String):Boolean{
      return flashWebcamPattern.test(streamId);
    }

    public function handleGuestPolicyChanged(msg:Object):void {
      
      var header: Object = msg.header as Object;
      var body: Object = msg.body as Object;
      var policy: String = body.policy as String;
      LOGGER.debug("*** handleGuestPolicyChanged " + policy + " ****");
      LiveMeeting.inst().guestsWaiting.setGuestPolicy(policy);
    }
    
    public function handleGetGuestPolicyReply(msg:Object):void {
      var header: Object = msg.header as Object;
      var body: Object = msg.body as Object;
      var policy: String = body.policy as String;
      
      LiveMeeting.inst().guestsWaiting.setGuestPolicy(policy);
    }
    
    public function handleUserRoleChangedEvtMsg(msg:Object):void {
      var header: Object = msg.header as Object;
      var body: Object = msg.body as Object;
      var userId: String = body.userId as String;
      var role: String = body.role as String;

      LiveMeeting.inst().users.setRoleForUser(userId, role);
      if (UsersUtil.isMe(userId)) {
        LiveMeeting.inst().me.role = role;
        dispatcher.dispatchEvent(new ChangeMyRole(role));
        
        // need to fake a new lock settings so that the lock state gets revalidated
        UsersUtil.applyLockSettings();
      }

      dispatcher.dispatchEvent(new UserStatusChangedEvent(userId));
    }
  }
}

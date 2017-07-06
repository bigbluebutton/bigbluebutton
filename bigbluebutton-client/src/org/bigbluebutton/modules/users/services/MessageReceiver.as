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
  
  import org.as3commons.lang.StringUtils;
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.EventConstants;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.events.CoreEvent;
  import org.bigbluebutton.core.events.NewGuestWaitingEvent;
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
  import org.bigbluebutton.main.model.users.events.StreamStartedEvent;
  import org.bigbluebutton.main.model.users.events.StreamStoppedEvent;
  import org.bigbluebutton.modules.screenshare.events.WebRTCViewStreamEvent;
  import org.bigbluebutton.modules.users.events.MeetingMutedEvent;

  public class MessageReceiver implements IMessageListener
  {
	private static const LOGGER:ILogger = getClassLogger(MessageReceiver);

    private var dispatcher:Dispatcher;

    public var onAllowedToJoin:Function = null;
    private static var globalDispatcher:Dispatcher = new Dispatcher();

    public function MessageReceiver() {
      BBB.initConnectionManager().addMessageListener(this);
      this.dispatcher = new Dispatcher();
    }

    public function onMessage(messageName:String, message:Object):void {
      LOGGER.debug(" received message " + messageName);

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
        case "UserTalkingEvtMsg":
          handleUserTalkingEvtMsg(message);
          break;
        case "UserMutedEvtMsg":
          handleUserMutedEvtMsg(message);
          break;
        case "GuestsWaitingForApprovalEvtMsg":
          handleGuestsWaitingForApprovalEvtMsg(message);
          break;
        case "meetingEnded":
          handleLogout(message);
          break;
        case "meetingEnding":
          handleMeetingEnding(message);
          break;
        case "meetingHasEnded":
          handleMeetingHasEnded(message);
          break;
        case "meetingMuted":
          handleMeetingMuted(message);
          break;   
        case "meetingState":
          handleMeetingState(message);
          break;  
        case "inactivityWarning":
          handleInactivityWarning(message);
          break;
        case "meetingIsActive":
          handleMeetingIsActive(message);
          break;
        case "UserEmojiChangedEvtMsg":
          handleEmojiStatusHand(message);
          break;
        case "getRecordingStatusReply":
          handleGetRecordingStatusReply(message);
          break;
        case "recordingStatusChanged":
          handleRecordingStatusChanged(message);
          break;
        case "user_listening_only":
          handleUserListeningOnly(message);
          break;
        case "permissionsSettingsChanged":
          handlePermissionsSettingsChanged(message);
          break;
        case "userLocked":
          handleUserLocked(message);
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
		case "TimeRemainingUpdateEvtMsg":
	      handleTimeRemainingUpdate(message);
		  break;
		case "BreakoutRoomsTimeRemainingUpdateEvtMsg":
		  handleBreakoutRoomsTimeRemainingUpdate(message);
		  break;
		case "BreakoutRoomStartedEvtMsg":
		  handleBreakoutRoomStarted(message);
		  break;
		case "BreakoutRoomClosedEvtMsg":
		  handleBreakoutRoomClosed(message);
		  break;
        case "userEjectedFromMeeting":
          handleUserEjectedFromMeeting(message);
          break;
        case "DeskShareRTMPBroadcastNotification":
          handleDeskShareRTMPBroadcastNotification(message);
          break;
        case "get_guest_policy_reply":
          handleGetGuestPolicyReply(message);
          break;
        case "guest_policy_changed":
          handleGuestPolicyChanged(message);
          break;
        case "guest_access_denied":
          handleGuestAccessDenied(message);
          break;
      }
    }

    private function handleUserJoinedVoiceConfToClientEvtMsg(msg: Object): void {
      var header: Object = msg.header as Object;
      var body: Object = msg.body as Object;
 
      var vu: VoiceUser2x = new VoiceUser2x();
      vu.intId = body.intId as String;
      vu.voiceUserId = body.voiceUserId as String;
      vu.callerName = body.callerName as String;
      vu.callerNum = body.callerNum as String;
      vu.muted = body.muted as Boolean;
      vu.talking = body.talking as Boolean;
      vu.callingWith = body.callingWith as String;
      vu.listenOnly = body.listenOnly as Boolean;
      
      LiveMeeting.inst().voiceUsers.add(vu);
      
      if (UsersUtil.isMe(vu.intId)) {
        LiveMeeting.inst().me.muted = vu.muted;
        LiveMeeting.inst().me.inVoiceConf = true;
      }
      
      var bbbEvent:BBBEvent = new BBBEvent(BBBEvent.USER_VOICE_JOINED);
      bbbEvent.payload.userID = vu.intId;            
      globalDispatcher.dispatchEvent(bbbEvent);
        
    }
    
    private function handleUserLeftVoiceConfToClientEvtMsg(msg: Object):void {
      var header: Object = msg.header as Object;
      var body: Object = msg.body as Object;
      var intId: String = body.intId as String;
      
      LiveMeeting.inst().voiceUsers.remove(intId);
      
      if (UsersUtil.isMe(intId)) {
        LiveMeeting.inst().me.muted = false;
        LiveMeeting.inst().me.inVoiceConf = false;
      }
      
      var bbbEvent:BBBEvent = new BBBEvent(BBBEvent.USER_VOICE_LEFT);
      bbbEvent.payload.userID = intId;
      globalDispatcher.dispatchEvent(bbbEvent);
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
      var guestWaiting: GuestWaiting = new GuestWaiting(guest.intId, guest.name, guest.role);
      LiveMeeting.inst().guestsWaiting.add(guestWaiting);
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
    
    private function handleGetUsersMeetingRespMsg(msg: Object):void {
      var body: Object = msg.body as Object
      var users: Array = body.users as Array;
      LOGGER.debug("Num USERs = " + users.length);

      for (var i:int = 0; i < users.length; i++) {
        var user:Object = users[i] as Object;
        processUserJoinedMeetingMsg(user);
      } 
    }
    
    public function handleUserLeftMeetingEvtMsg(msg:Object):void {     
      var body: Object = msg.body as Object
      var userId: String = body.intId as String;
      
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
    
    private function handleUserJoinedMeetingEvtMsg(msg:Object):void {
      var body: Object = msg.body as Object;
      processUserJoinedMeetingMsg(body);
    }
    
    private function processUserJoinedMeetingMsg(user:Object):void {
      var intId: String = user.intId as String;
      var extId: String = user.extId as String;
      var name: String = user.name as String;
      var role: String = user.role as String;
      var guest: Boolean = user.role as Boolean;
      var authed: Boolean = user.authed as Boolean;
      var waitingForAcceptance: Boolean = user.waitingForAcceptance as Boolean;
      var emoji: String = user.emoji as String;
      var locked: Boolean = user.locked as Boolean;
      var presenter: Boolean = user.presenter as Boolean;
      var avatar: String = user.avatar as String;
      
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
      
      LOGGER.debug("USER JOINED = " + JSON.stringify(user2x));
      
      LiveMeeting.inst().users.add(user2x);
      
      var joinEvent:UserJoinedEvent = new UserJoinedEvent(UserJoinedEvent.JOINED);
      joinEvent.userID = user2x.intId;
      dispatcher.dispatchEvent(joinEvent);
    }
    
    private function handleGetVoiceUsersMeetingRespMsg(msg:Object):void {
      var body: Object = msg.body as Object
      var users: Array = body.users as Array;
      LOGGER.debug("Num USERs = " + users.length);
      
      for (var i:int = 0; i < users.length; i++) {
        var user:Object = users[i] as Object;
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
        
        LOGGER.debug("USER = " + JSON.stringify(vu));
        LiveMeeting.inst().voiceUsers.add(vu);
      }
    }
    
    private function handleGetWebcamStreamsMeetingRespMsg(msg:Object):void {
      var body: Object = msg.body as Object
      var streams: Array = body.streams as Array;
      LOGGER.debug("Num streams = " + streams.length);
      
      for (var i:int = 0; i < streams.length; i++) {
        var stream:Object = streams[i] as Object;
        var streamId: String = stream.streamId as String;
        var media: Object = stream.stream as Object;
        var url: String = media.url as String;
        var userId: String = media.userId as String;
        var attributes: Object = media.attributes as Object;
        var viewers: Array = media.viewers as Array;
        
        var webcamStream: MediaStream = new MediaStream(streamId, userId);
        webcamStream.streamId = streamId;
        webcamStream.userId = userId;
        webcamStream.attributes = attributes;
        webcamStream.viewers = viewers;
        
        LOGGER.debug("STREAM = " + JSON.stringify(webcamStream));
        LiveMeeting.inst().webcams.add(webcamStream);
      }
    }
    
    private function handleDeskShareRTMPBroadcastNotification(msg:Object):void {
      var event:WebRTCViewStreamEvent;
      if (msg.broadcasting) {
        event = new WebRTCViewStreamEvent(WebRTCViewStreamEvent.START);
      } else {
        event = new WebRTCViewStreamEvent(WebRTCViewStreamEvent.STOP);
      }

      event.videoWidth = msg.width;
      event.videoHeight = msg.height;
      event.rtmp = msg.rtmpUrl;

      dispatcher.dispatchEvent(event);
    }

    private function handleUserEjectedFromMeeting(msg: Object):void {
        UsersUtil.setUserEjected();
        var logData:Object = UsersUtil.initLogData();
        logData.tags = ["users"];
        logData.status = "user_ejected";
        logData.message = "User ejected from meeting.";

        LOGGER.info(JSON.stringify(logData));
      
    }

	private function handleUserLocked(msg:Object):void {
		var map:Object = JSON.parse(msg.msg);
		var user:User2x = UsersUtil.getUser(map.user);

		if(user.locked != map.lock) {
      if (UsersUtil.isMe(user.intId)) {
        LiveMeeting.inst().me.locked = map.locked;
      }
      
      dispatcher.dispatchEvent(new UserStatusChangedEvent(user.intId));
    }
			
		return;
	}
	
    private function handleMeetingHasEnded(msg: Object):void {
      LOGGER.debug("*** handleMeetingHasEnded {0} **** \n", [msg.msg]); 
    }
    
    private function handlePermissionsSettingsChanged(msg:Object):void {
      //LOGGER.debug("handlePermissionsSettingsChanged {0} \n", [msg.msg]);
      var map:Object = JSON.parse(msg.msg);
      var lockSettings:LockSettingsVO = new LockSettingsVO(map.disableCam,
	  														map.disableMic,
	  														map.disablePrivateChat,
	  														map.disablePublicChat,
	  														map.lockedLayout,
	  														map.lockOnJoin,
	  														map.lockOnJoinConfigurable);
      UsersUtil.setLockSettings(lockSettings);
    }
    
    private function sendRecordingStatusUpdate(recording:Boolean):void {
      LiveMeeting.inst().meetingStatus.isRecording = recording;
      
      var e:BBBEvent = new BBBEvent(BBBEvent.CHANGE_RECORDING_STATUS);
      e.payload.remote = true;
      e.payload.recording = recording;

      dispatcher.dispatchEvent(e);
    }
    
    
    private function handleMeetingMuted(msg:Object):void {
      var map:Object = JSON.parse(msg.msg);
      if (map.hasOwnProperty("meetingMuted")) {
        LiveMeeting.inst().meetingStatus.isMeetingMuted = map.meetingMuted;
        dispatcher.dispatchEvent(new MeetingMutedEvent());
      }
    }
    
    private function handleMeetingState(msg:Object):void {
      var map:Object = JSON.parse(msg.msg);  
      var perm:Object = map.permissions;
      
      var lockSettings:LockSettingsVO = new LockSettingsVO(perm.disableCam, perm.disableMic,
                                                 perm.disablePrivateChat, perm.disablePublicChat, 
                                                 perm.lockedLayout, perm.lockOnJoin, perm.lockOnJoinConfigurable);
      UsersUtil.setLockSettings(lockSettings);
      LiveMeeting.inst().meetingStatus.isMeetingMuted = map.meetingMuted;
      
      UsersUtil.applyLockSettings();
    }
    
    private function handleInactivityWarning(msg:Object):void {
      var map:Object = JSON.parse(msg.msg);

      var bbbEvent:BBBEvent = new BBBEvent(BBBEvent.INACTIVITY_WARNING_EVENT);
      bbbEvent.payload.duration = map.duration;
      globalDispatcher.dispatchEvent(bbbEvent);
    }

    private function handleMeetingIsActive(msg:Object):void {
      var bbbEvent:BBBEvent = new BBBEvent(BBBEvent.MEETING_IS_ACTIVE_EVENT);
      globalDispatcher.dispatchEvent(bbbEvent);
    }

    private function handleGetRecordingStatusReply(msg: Object):void {     
      var map:Object = JSON.parse(msg.msg);
      sendRecordingStatusUpdate(map.recording);      
    }
    
    private function handleRecordingStatusChanged(msg: Object):void {    
      var map:Object = JSON.parse(msg.msg);
      sendRecordingStatusUpdate(map.recording);
    }
    
    private function handleUserListeningOnly(msg: Object):void {  
      var map:Object = JSON.parse(msg.msg);  
      var userId:String = map.userId;
      var listenOnly:Boolean = map.listenOnly;
      
      LiveMeeting.inst().voiceUsers.setListenOnlyForUser(userId, listenOnly);
    }
    

    private function userTalk(userId:String, talking:Boolean):void { 
      LiveMeeting.inst().voiceUsers.setMutedForUser(userId, talking);
      
      var event:CoreEvent = new CoreEvent(EventConstants.USER_TALKING);
      event.message.userID = userId;
      event.message.talking = talking;
      globalDispatcher.dispatchEvent(event);  
      
    }
    

    
    /**
     * Called by the server to tell the client that the meeting has ended.
     */
    public function handleLogout(msg:Object):void {     
      var endMeetingEvent:BBBEvent = new BBBEvent(BBBEvent.END_MEETING_EVENT);
      dispatcher.dispatchEvent(endMeetingEvent);
    }
    
    /**
     * This meeting is in the process of ending by the server
     */
    public function handleMeetingEnding(msg:Object):void {
      // Avoid trying to reconnect
      var endMeetingEvent:BBBEvent = new BBBEvent(BBBEvent.CANCEL_RECONNECTION_EVENT);
      dispatcher.dispatchEvent(endMeetingEvent);
    }
    
    public function handleAssignPresenterCallback(msg:Object):void {     
      var header:Object = msg.header as Object;
      var body: Object = msg.body as Object;
      
      var newPresenterID:String = body.presenterId as String;
      var newPresenterName:String = body.presenterName as String;
      var assignedBy:String = body.assignedBy as String;
      
      if (UsersUtil.isMe(newPresenterID)) {
        sendSwitchedPresenterEvent(true, newPresenterID);
        
        UsersUtil.setMeAsPresenter(true);
        
        var e:MadePresenterEvent = new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_PRESENTER_MODE);
        e.userID = newPresenterID;
        e.presenterName = newPresenterName;
        e.assignerBy = assignedBy;
        
        dispatcher.dispatchEvent(e);	
        
      } else {	
        sendSwitchedPresenterEvent(false, newPresenterID);
        
        UsersUtil.setMeAsPresenter(false);
        var viewerEvent:MadePresenterEvent = new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_VIEWER_MODE);
        viewerEvent.userID = newPresenterID;
        viewerEvent.presenterName = newPresenterName;
        viewerEvent.assignerBy = assignedBy;
        
        dispatcher.dispatchEvent(viewerEvent);
      }
      
      dispatcher.dispatchEvent(new UserStatusChangedEvent(newPresenterID));
      
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

    private function sendUserEmojiChangedEvent(userId: String, emoji: String):void{
      var dispatcher:Dispatcher = new Dispatcher();
      dispatcher.dispatchEvent(new UserEmojiChangedEvent(userId, emoji));
    }
    
    
    private function handleUserBroadcastCamStartedEvtMsg(msg:Object):void {
        var userId: String = msg.body.userId as String; 
        var streamId: String = msg.body.stream as String;
        
        var logData:Object = UsersUtil.initLogData();
        logData.tags = ["webcam"];
        logData.message = "UserBroadcastCamStartedEvtMsg server message";
        logData.user.webcamStream = streamId;
        LOGGER.info(JSON.stringify(logData));

        var mediaStream: MediaStream = new MediaStream(streamId, userId)
        LiveMeeting.inst().webcams.add(mediaStream);
        
        var webUser: User2x = UsersUtil.getUser(userId);
        if (webUser != null) {
          webUser.streamNames.push(streamId);
          sendStreamStartedEvent(userId, webUser.name, streamId);
        }
        
    }

    private function sendStreamStartedEvent(userId: String, name: String, stream: String):void{
      var dispatcher:Dispatcher = new Dispatcher();
      dispatcher.dispatchEvent(new StreamStartedEvent(userId, name, stream));
    }
    
    private function handleUserBroadcastCamStoppedEvtMsg(msg: Object):void {  
        var userId: String = msg.body.userId as String; 
        var stream: String = msg.body.stream as String;

        var logData:Object = UsersUtil.initLogData();
        logData.tags = ["webcam"];
        logData.message = "UserBroadcastCamStoppedEvtMsg server message";
        logData.user.webcamStream = stream;
        LOGGER.info(JSON.stringify(logData));
	  
        sendStreamStoppedEvent(userId, stream);
    }
	
	private function sendStreamStoppedEvent(userId: String, streamId: String):void{
		var dispatcher:Dispatcher = new Dispatcher();
		dispatcher.dispatchEvent(new StreamStoppedEvent(userId, streamId));
	}
    

    

	
	private function handleBreakoutRoomsList(msg:Object):void{
		for each(var room : Object in msg.body.rooms)
		{
			var breakoutRoom : BreakoutRoom = new BreakoutRoom();
			breakoutRoom.meetingId = room.meetingId;
			breakoutRoom.externalMeetingId = room.externalMeetingId;
			breakoutRoom.name = room.name;
			breakoutRoom.sequence = room.sequence;
      LiveMeeting.inst().breakoutRooms.addBreakoutRoom(breakoutRoom);
		}
    LiveMeeting.inst().breakoutRooms.breakoutRoomsReady = msg.body.roomsReady;
	}
	
	private function handleBreakoutRoomJoinURL(msg:Object):void{
		var externalMeetingId : String = StringUtils.substringBetween(msg.body.redirectJoinURL, "meetingID=", "&");
		var breakoutRoom : BreakoutRoom = LiveMeeting.inst().breakoutRooms.getBreakoutRoomByExternalId(externalMeetingId);
		var sequence : int = breakoutRoom.sequence;
		
		var event : BreakoutRoomEvent = new BreakoutRoomEvent(BreakoutRoomEvent.BREAKOUT_JOIN_URL);
		event.joinURL = msg.body.redirectJoinURL;
		event.breakoutMeetingSequence = sequence;
		dispatcher.dispatchEvent(event);
		
		// We delay assigning last room invitation sequence to be sure it is handle in time by the item renderer
		setTimeout(function() : void {LiveMeeting.inst().breakoutRooms.setLastBreakoutRoomInvitation(sequence)}, 1000);
	}
	
	private function handleUpdateBreakoutUsers(msg:Object):void{
//		UserManager.getInstance().getConference().updateBreakoutRoomUsers(msg.body.breakoutMeetingId, msg.body.users);
	}

	private function handleTimeRemainingUpdate(msg:Object):void {
		var map:Object = JSON.parse(msg.body);
		var e:BreakoutRoomEvent = new BreakoutRoomEvent(BreakoutRoomEvent.UPDATE_REMAINING_TIME_BREAKOUT);
		e.durationInMinutes = map.timeRemaining;
		dispatcher.dispatchEvent(e);
	}
	
	private function handleBreakoutRoomsTimeRemainingUpdate(msg:Object):void {
		var e:BreakoutRoomEvent = new BreakoutRoomEvent(BreakoutRoomEvent.UPDATE_REMAINING_TIME_PARENT);
		e.durationInMinutes = msg.body.timeRemaining;
		dispatcher.dispatchEvent(e);
	}
	
	private function handleBreakoutRoomStarted(msg:Object):void{
		var breakoutRoom : BreakoutRoom = new BreakoutRoom();
		breakoutRoom.meetingId = msg.body.breakoutMeetingId;
		breakoutRoom.externalMeetingId = msg.body.externalMeetingId;
		breakoutRoom.name = msg.body.name;
		breakoutRoom.sequence = msg.body.sequence;
    LiveMeeting.inst().breakoutRooms.addBreakoutRoom(breakoutRoom);
	}
	
	private function handleBreakoutRoomClosed(msg:Object):void{
    switchUserFromBreakoutToMainVoiceConf(msg.body.breakoutMeetingId);
    var breakoutRoom: BreakoutRoom = LiveMeeting.inst().breakoutRooms.getBreakoutRoom(msg.body.breakoutMeetingId);
    LiveMeeting.inst().breakoutRooms.removeBreakoutRoom(msg.body.breakoutMeetingId);    
//		UserManager.getInstance().getConference().removeBreakoutRoomFromUser(breakoutRoom);
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



    public function handleGuestPolicyChanged(msg:Object):void {
      LOGGER.debug("*** handleGuestPolicyChanged " + msg.msg + " **** \n");
      var map:Object = JSON.parse(msg.msg);

      var policy:BBBEvent = new BBBEvent(BBBEvent.RETRIEVE_GUEST_POLICY);
      policy.payload['guestPolicy'] = map.guestPolicy;
      dispatcher.dispatchEvent(policy);
    }

    public function handleGetGuestPolicyReply(msg:Object):void {
      LOGGER.debug("*** handleGetGuestPolicyReply " + msg.msg + " **** \n");
      var map:Object = JSON.parse(msg.msg);

      var policy:BBBEvent = new BBBEvent(BBBEvent.RETRIEVE_GUEST_POLICY);
      policy.payload['guestPolicy'] = map.guestPolicy;
      dispatcher.dispatchEvent(policy);
    }

    public function handleGuestAccessDenied(msg:Object):void {
      LOGGER.debug("*** handleGuestAccessDenied " + msg.msg + " ****");
      var map:Object = JSON.parse(msg.msg);

      if (UsersUtil.getMyUserID() == map.userId) {
        dispatcher.dispatchEvent(new LogoutEvent(LogoutEvent.MODERATOR_DENIED_ME));
      }
    }
  }
}

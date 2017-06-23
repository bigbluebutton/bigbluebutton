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
  import org.bigbluebutton.core.events.UserStatusChangedEvent;
  import org.bigbluebutton.core.model.LiveMeeting;
  import org.bigbluebutton.core.model.MediaStream;
  import org.bigbluebutton.core.model.users.User2x;
  import org.bigbluebutton.core.model.users.VoiceUser2x;
  import org.bigbluebutton.core.vo.LockSettingsVO;
  import org.bigbluebutton.main.events.BBBEvent;
  import org.bigbluebutton.main.events.BreakoutRoomEvent;
  import org.bigbluebutton.main.events.LogoutEvent;
  import org.bigbluebutton.main.events.MadePresenterEvent;
  import org.bigbluebutton.main.events.PresenterStatusEvent;
  import org.bigbluebutton.main.events.SwitchedPresenterEvent;
  import org.bigbluebutton.main.events.UserJoinedEvent;
  import org.bigbluebutton.main.model.users.BreakoutRoom;
  import org.bigbluebutton.main.model.users.IMessageListener;
  import org.bigbluebutton.main.model.users.events.ChangeMyRole;
  import org.bigbluebutton.main.model.users.events.StreamStoppedEvent;
  import org.bigbluebutton.main.model.users.events.UsersConnectionEvent;
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
        case "PresenterAssignedEvtMsg":
          handleAssignPresenterCallback(message);
          break;
        case "UserBroadcastCamStartedEvtMsg": 
          handleUserBroadcastCamStartedEvtMsg(message);
          break;
        case "UserBroadcastCamStoppedEvtMsg": 
          handleUserBroadcastCamStoppedEvtMsg(message);
          break;  
        case "getUsersReply":
          handleGetUsersReply(message);
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
        case "participantJoined":
          handleParticipantJoined(message);
          break;
        case "participantLeft":
          handleParticipantLeft(message);
          break;
        case "participantStatusChange":
          handleParticipantStatusChange(message);
          break;
        case "participantRoleChange":
          handleParticipantRoleChange(message);
          break;
        case "userJoinedVoice":
          handleUserJoinedVoice(message);
          break;
        case "userLeftVoice":
          handleUserLeftVoice(message);
          break;
        case "voiceUserMuted":
          handleVoiceUserMuted(message);
          break;
        case "voiceUserTalking":
          handleVoiceUserTalking(message);
          break;
        case "userEmojiStatus":
          handleEmojiStatusHand(message);
          break;
        case "getRecordingStatusReply":
          handleGetRecordingStatusReply(message);
          break;
        case "recordingStatusChanged":
          handleRecordingStatusChanged(message);
          break;
        case "joinMeetingReply":
          handleJoinedMeeting(message);
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

    private function handleGetUsersMeetingRespMsg(msg: Object):void {
      var body: Object = msg.body as Object
      var users: Array = body.users as Array;
      LOGGER.debug("Num USERs = " + users.length);

      for (var i:int = 0; i < users.length; i++) {
        var user:Object = users[i] as Object;
        processUserJoinedMeetingMsg(user);
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
      
      LOGGER.debug("USER = " + JSON.stringify(user2x));
      
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
        
        var webcamStream: MediaStream = new MediaStream();
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
    
    private function handleJoinedMeeting(msg:Object):void {
		LOGGER.debug("*** handleJoinedMeeting {0} **** \n", [msg.msg]); 
      var map:Object = JSON.parse(msg.msg);
      var userid: String = map.user.userId;
      
      var e:UsersConnectionEvent = new UsersConnectionEvent(UsersConnectionEvent.CONNECTION_SUCCESS);
      e.userid = userid;
      dispatcher.dispatchEvent(e);      

      // If the user was the presenter he's reconnecting and must become viewer
      if (UsersUtil.amIPresenter()) {
        sendSwitchedPresenterEvent(false, UsersUtil.getPresenterUserID());
        UsersUtil.setMeAsPresenter(false);
        var viewerEvent:MadePresenterEvent = new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_VIEWER_MODE);
        dispatcher.dispatchEvent(viewerEvent);
      }

      var myRole:String = UsersUtil.getMyRole();
      var role:String = map.user.role;
      // If a (pro/de)moted user refresh his browser he must reassing his role for permissions
      if (role != myRole) {
        UsersUtil.newUserRoleForUser(userid, role);
        UsersUtil.setMyRole(role);
        
        var changeMyRole:ChangeMyRole = new ChangeMyRole(role);
        dispatcher.dispatchEvent(changeMyRole);
      }
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
    
    private function handleVoiceUserMuted(msg:Object):void {    
      var map:Object = JSON.parse(msg.msg);
      var userId:String = map.userId;
      var muted:Boolean = map.muted;

      LiveMeeting.inst().voiceUsers.setMutedForUser(userId, muted);
      
      if (UsersUtil.isMe(userId)) {
        UsersUtil.setMeMuted(muted);
      }
      
      var bbbEvent:BBBEvent = new BBBEvent(BBBEvent.USER_VOICE_MUTED);
      bbbEvent.payload.muted = muted;
      bbbEvent.payload.userID = userId;
      globalDispatcher.dispatchEvent(bbbEvent);    
    }

    private function userTalk(userId:String, talking:Boolean):void { 
      LiveMeeting.inst().voiceUsers.setMutedForUser(userId, talking);
      
      var event:CoreEvent = new CoreEvent(EventConstants.USER_TALKING);
      event.message.userID = userId;
      event.message.talking = talking;
      globalDispatcher.dispatchEvent(event);  
      
    }
    
    private function handleVoiceUserTalking(msg:Object):void {   
      var map:Object = JSON.parse(msg.msg); 
      var userId:String = map.userId;
      var talking:Boolean = map.talking;
      userTalk(userId, talking);
    }
    
    private function handleUserLeftVoice(msg:Object):void {  
      LOGGER.debug("*** handleUserLeftVoice " + msg.msg + " **** \n"); 
      var map:Object = JSON.parse(msg.msg);
      
      var webUser:Object = map.user as Object;
      var voiceUser:Object = webUser.voiceUser as Object;
      
      LiveMeeting.inst().voiceUsers.remove(webUser.userId);
      
      if (UsersUtil.isMe(webUser.userId)) {
        LiveMeeting.inst().me.muted = false;
        LiveMeeting.inst().me.inVoiceConf = false;
      }
      
      var bbbEvent:BBBEvent = new BBBEvent(BBBEvent.USER_VOICE_LEFT);
      bbbEvent.payload.userID = webUser.userId;
      globalDispatcher.dispatchEvent(bbbEvent);
      
    }
    
    private function handleUserJoinedVoice(msg:Object):void {
		LOGGER.debug("*** handleUserJoinedVoice " + msg.msg + " **** \n"); 
      var map:Object = JSON.parse(msg.msg);
      var webUser:Object = map.user as Object;
      userJoinedVoice(webUser);

      return;
    }
    
    private function userJoinedVoice(webUser: Object):void {      
      var voiceUser:Object = webUser.voiceUser as Object;
      
      var externUserID:String = webUser.externUserID;
      var internUserID:String = webUser.userId;
      
      if (UsersUtil.isMe(internUserID)) {
        LiveMeeting.inst().me.muted = voiceUser.muted;
        LiveMeeting.inst().me.inVoiceConf = true;
      }
/*      
      if (UsersUtil.hasUser(internUserID)) {
        var bu:User2x = UsersUtil.getUser(internUserID);
        bu.talking = voiceUser.talking;
        bu.voiceMuted = voiceUser.muted;
        bu.voiceJoined = true;
        
        var bbbEvent:BBBEvent = new BBBEvent(BBBEvent.USER_VOICE_JOINED);
        bbbEvent.payload.userID = bu.userID;            
        globalDispatcher.dispatchEvent(bbbEvent);
        
        if (UsersUtil.getLockSettings().getDisableMic() && !bu.voiceMuted && bu.userLocked && bu.me) {
          var ev:VoiceConfEvent = new VoiceConfEvent(VoiceConfEvent.MUTE_USER);
          ev.userid = voiceUser.userId;
          ev.mute = true;
          dispatcher.dispatchEvent(ev);
        }
      }    
      */
    }
    
    public function handleParticipantLeft(msg:Object):void {     
      var map:Object = JSON.parse(msg.msg);
      var webUser:Object = map.user as Object;
      
      var webUserId:String = webUser.userId;
      

      if(webUser.waitingForAcceptance) {
        var removeGuest:BBBEvent = new BBBEvent(BBBEvent.REMOVE_GUEST_FROM_LIST);
        removeGuest.payload.userId = webUser.userId;
        dispatcher.dispatchEvent(removeGuest);
      }
/*
      var user:BBBUser = UserManager.getInstance().getConference().getUser(webUserId);
      
	  if (user != null) {
		  
		  // Flag that the user is leaving the meeting so that apps (such as avatar) doesn't hang
		  // around when the user already left.
		  user.isLeavingFlag = true;
		  
		  var joinEvent:UserLeftEvent = new UserLeftEvent(UserLeftEvent.LEFT);
		  joinEvent.userID = user.userID;
		  dispatcher.dispatchEvent(joinEvent);	
		  
		  UserManager.getInstance().getConference().removeUser(webUserId);	    
	  }
      */
    }
    
    public function handleParticipantJoined(msg:Object):void {
      var map:Object = JSON.parse(msg.msg);
      
      var user:Object = map.user as Object;
      
      participantJoined(user);
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

    private function handleGetUsersReply(msg:Object):void {    
      var map:Object = JSON.parse(msg.msg);
      var users:Object = map.users as Array;

      
      if (map.count > 0) {
        for(var i:int = 0; i < users.length; i++) {
          var user:Object = users[i] as Object;
          participantJoined(user);
          processUserVoice(user);
        }
        
        UsersUtil.applyLockSettings();
      }	 
    }
    
    private function processUserVoice(webUser: Object):void {      
      var voiceUser:Object = webUser.voiceUser as Object;
/*
      var externUserID:String = webUser.externUserID;
      var internUserID:String = webUser.userId;
      
      if (UsersUtil.getMyUserID() == internUserID) {
        _conference.muteMyVoice(voiceUser.muted);
        _conference.setMyVoiceJoined(voiceUser.joined);
      }
      
      if (UsersUtil.hasUser(internUserID)) {
        var bu:VoiceUser2x = LiveMeeting.inst().voiceUsers(internUserID);
        if (bu != null) {
          bu.muted = voiceUser.muted;
          bu.talking = voiceUser.talking;
        }

      }   
      */
    }
    
    public function handleAssignPresenterCallback(msg:Object):void {     
      var header:Object = msg.header as Object;
      var body: Object = msg.body as Object;
        
      var newPresenterID:String = body.presenterId;
      var newPresenterName:String = body.presenterName;
      var assignedBy:String = body.assignedBy;
      
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
      var map:Object = JSON.parse(msg.msg);      

    }

    private function handleUserBroadcastCamStartedEvtMsg(msg:Object):void {
        var userId: String = msg.body.userId as String; 
        var stream: String = msg.body.stream as String;
        
        var logData:Object = UsersUtil.initLogData();
        logData.tags = ["webcam"];
        logData.message = "UserBroadcastCamStartedEvtMsg server message";
        logData.user.webcamStream = stream;
        LOGGER.info(JSON.stringify(logData));


    }

    private function handleUserBroadcastCamStoppedEvtMsg(msg: Object):void {  
        var userId: String = msg.body.userId as String; 
        var stream: String = msg.body.stream as String;

        var logData:Object = UsersUtil.initLogData();
        logData.tags = ["webcam"];
        logData.message = "UserBroadcastCamStoppedEvtMsg server message";
        logData.user.webcamStream = stream;
        LOGGER.info(JSON.stringify(logData));
	  
//        UserManager.getInstance().getConference().unsharedWebcam(userId, stream);
        sendStreamStoppedEvent(userId, stream);
    }
	
	private function sendStreamStoppedEvent(userId: String, streamId: String):void{
		var dispatcher:Dispatcher = new Dispatcher();
		dispatcher.dispatchEvent(new StreamStoppedEvent(userId, streamId));
	}
    
    public function participantStatusChange(userID:String, status:String, value:Object):void {		
//      UserManager.getInstance().getConference().newUserStatus(userID, status, value);
      
      if (status == "presenter"){
        var e:PresenterStatusEvent = new PresenterStatusEvent(PresenterStatusEvent.PRESENTER_NAME_CHANGE);
        e.userID = userID;
        
        dispatcher.dispatchEvent(e);
      }		
    }
    
    public function participantJoined(joinedUser:Object):void {    
/**      
      var user:BBBUser = new BBBUser();
      user.userID = joinedUser.userId;
      user.name = joinedUser.name;
      user.role = joinedUser.role;
      user.guest = joinedUser.guest;
      user.waitingForAcceptance = joinedUser.waitingForAcceptance;
      user.externUserID = joinedUser.externUserID;
      user.isLeavingFlag = false;
      user.listenOnly = joinedUser.listenOnly;
      user.userLocked = joinedUser.locked;
      user.avatarURL = joinedUser.avatarURL;
      user.me = (user.userID == UsersUtil.getMyUserID());

      UserManager.getInstance().getConference().addUser(user);
      
      if (joinedUser.hasStream) {
        var streams:Array = joinedUser.webcamStream;
        for each(var stream:String in streams) {
          UserManager.getInstance().getConference().sharedWebcam(user.userID, stream);
        }
      }

      if (joinedUser.voiceUser.joined) {
        userJoinedVoice(joinedUser);
      }

      UserManager.getInstance().getConference().presenterStatusChanged(user.userID, joinedUser.presenter);
      UserManager.getInstance().getConference().emojiStatus(user.userID, joinedUser.emojiStatus);
           
      var joinEvent:UserJoinedEvent = new UserJoinedEvent(UserJoinedEvent.JOINED);
      joinEvent.userID = user.userID;
      dispatcher.dispatchEvent(joinEvent);	

      if (user.guest) {
        if (user.waitingForAcceptance) {
          if (user.me) {
            var waitCommand:BBBEvent = new BBBEvent(BBBEvent.WAITING_FOR_MODERATOR_ACCEPTANCE);
            dispatcher.dispatchEvent(waitCommand);
          } else {
            var e:BBBEvent = new BBBEvent(BBBEvent.ADD_GUEST_TO_LIST);
            e.payload.userId = user.userID;
            e.payload.name = user.name;
            dispatcher.dispatchEvent(e);
          }
        } else {
          if (user.me) {
            var allowedCommand:BBBEvent = new BBBEvent(BBBEvent.MODERATOR_ALLOWED_ME_TO_JOIN);
            dispatcher.dispatchEvent(allowedCommand);
          } else {
            var removeGuest:BBBEvent = new BBBEvent(BBBEvent.REMOVE_GUEST_FROM_LIST);
            removeGuest.payload.userId = user.userID;
            dispatcher.dispatchEvent(removeGuest);
          }
        }
      }

      if (user.me && (!user.guest || !user.waitingForAcceptance)) {
        if (onAllowedToJoin != null) {
          onAllowedToJoin();
          onAllowedToJoin = null;
        }
      }
**/      
    }
    
    /**
     * Callback from the server from many of the bellow nc.call methods
     */
    public function handleParticipantStatusChange(msg:Object):void {
      var map:Object = JSON.parse(msg.msg);	
//      UserManager.getInstance().getConference().newUserStatus(map.userID, map.status, map.value);
      
      if (msg.status == "presenter"){
        var e:PresenterStatusEvent = new PresenterStatusEvent(PresenterStatusEvent.PRESENTER_NAME_CHANGE);
        e.userID = map.userID;
        
        dispatcher.dispatchEvent(e);
      }		
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

    public function handleParticipantRoleChange(msg:Object):void {
      var map:Object = JSON.parse(msg.msg);
      LOGGER.debug("*** received participant role change [" + map.userID + "," + map.role + "]");
/*
      UserManager.getInstance().getConference().newUserRole(map.userID, map.role);
      if(UsersUtil.isMe(map.userID)) {
        UserManager.getInstance().getConference().setMyRole(map.role);
        var e:ChangeMyRole = new ChangeMyRole(map.role);
        dispatcher.dispatchEvent(e);
      }
      */
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

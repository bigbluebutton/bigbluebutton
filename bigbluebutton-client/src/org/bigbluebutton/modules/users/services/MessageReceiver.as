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
  
  import org.as3commons.lang.StringUtils;
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.common.Role;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.EventConstants;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.events.CoreEvent;
  import org.bigbluebutton.core.events.VoiceConfEvent;
  import org.bigbluebutton.core.managers.UserManager;
  import org.bigbluebutton.core.model.MeetingModel;
  import org.bigbluebutton.core.services.UsersService;
  import org.bigbluebutton.core.vo.LockSettingsVO;
  import org.bigbluebutton.main.events.BBBEvent;
  import org.bigbluebutton.main.events.BreakoutRoomEvent;
  import org.bigbluebutton.main.events.MadePresenterEvent;
  import org.bigbluebutton.main.events.PresenterStatusEvent;
  import org.bigbluebutton.main.events.SwitchedPresenterEvent;
  import org.bigbluebutton.main.events.UserJoinedEvent;
  import org.bigbluebutton.main.events.UserLeftEvent;
  import org.bigbluebutton.main.model.users.BBBUser;
  import org.bigbluebutton.main.model.users.BreakoutRoom;
  import org.bigbluebutton.main.model.users.Conference;
  import org.bigbluebutton.main.model.users.IMessageListener;
  import org.bigbluebutton.main.model.users.events.StreamStoppedEvent;
  import org.bigbluebutton.main.model.users.events.UsersConnectionEvent;
  import org.bigbluebutton.modules.screenshare.events.WebRTCViewStreamEvent;
  import org.bigbluebutton.modules.users.events.MeetingMutedEvent;

  public class MessageReceiver implements IMessageListener
  {
	private static const LOGGER:ILogger = getClassLogger(MessageReceiver);

    private var dispatcher:Dispatcher;
    private var _conference:Conference;
    private static var globalDispatcher:Dispatcher = new Dispatcher();

    public function MessageReceiver() {
      _conference = UserManager.getInstance().getConference();
      BBB.initConnectionManager().addMessageListener(this);
      this.dispatcher = new Dispatcher();
    }

    public function onMessage(messageName:String, message:Object):void {
      // LOGGER.debug(" received message " + messageName);

      switch (messageName) {
        case "getUsersReply":
          handleGetUsersReply(message);
          break;
        case "assignPresenterCallback":
          handleAssignPresenterCallback(message);
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
        case "participantJoined":
          handleParticipantJoined(message);
          break;
        case "participantLeft":
          handleParticipantLeft(message);
          break;
        case "participantStatusChange":
          handleParticipantStatusChange(message);
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
        case "userSharedWebcam":
          handleUserSharedWebcam(message);
          break;
        case "userUnsharedWebcam":
          handleUserUnsharedWebcam(message);
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
		case "breakoutRoomsList":
		  handleBreakoutRoomsList(message)
		  break;
		case "breakoutRoomJoinURL":
		  handleBreakoutRoomJoinURL(message);
		  break;
		case "updateBreakoutUsers":
		  handleUpdateBreakoutUsers(message);
		  break;
		case "timeRemainingUpdate":
	      handleTimeRemainingUpdate(message);
		  break;
		case "breakoutRoomsTimeRemainingUpdate":
		  handleBreakoutRoomsTimeRemainingUpdate(message);
		  break;
		case "breakoutRoomStarted":
		  handleBreakoutRoomStarted(message);
		  break;
		case "breakoutRoomClosed":
		  handleBreakoutRoomClosed(message);
		  break;
        case "userEjectedFromMeeting":
          handleUserEjectedFromMeeting(message);
          break;
        case "DeskShareRTMPBroadcastNotification":
          handleDeskShareRTMPBroadcastNotification(message);
          break;
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
		var user:BBBUser = UsersUtil.getUser(map.user);

		if(user.userLocked != map.lock)
			user.lockStatusChanged(map.lock);
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
      UserManager.getInstance().getConference().setLockSettings(lockSettings);
    }
    
    private function sendRecordingStatusUpdate(recording:Boolean):void {
      MeetingModel.getInstance().recording = recording;
      
      var e:BBBEvent = new BBBEvent(BBBEvent.CHANGE_RECORDING_STATUS);
      e.payload.remote = true;
      e.payload.recording = recording;

      dispatcher.dispatchEvent(e);
    }
    
    private function handleJoinedMeeting(msg:Object):void {
      var map:Object = JSON.parse(msg.msg);
      var userid: String = map.user.userId;
      
      var e:UsersConnectionEvent = new UsersConnectionEvent(UsersConnectionEvent.CONNECTION_SUCCESS);
      e.userid = userid;
      dispatcher.dispatchEvent(e);      

      // If the user was the presenter he's reconnecting and must become viewer
      if (UserManager.getInstance().getConference().amIPresenter) {
        sendSwitchedPresenterEvent(false, UsersUtil.getPresenterUserID());
        UserManager.getInstance().getConference().amIPresenter = false;
        var viewerEvent:MadePresenterEvent = new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_VIEWER_MODE);
        dispatcher.dispatchEvent(viewerEvent);
      }
    }
    
    private function handleMeetingMuted(msg:Object):void {
      var map:Object = JSON.parse(msg.msg);
      if (map.hasOwnProperty("meetingMuted")) {
        MeetingModel.getInstance().meetingMuted = map.meetingMuted;
        dispatcher.dispatchEvent(new MeetingMutedEvent());
      }
    }
    
    private function handleMeetingState(msg:Object):void {
      var map:Object = JSON.parse(msg.msg);  
      var perm:Object = map.permissions;
      
      var lockSettings:LockSettingsVO = new LockSettingsVO(perm.disableCam, perm.disableMic,
                                                 perm.disablePrivateChat, perm.disablePublicChat, perm.lockedLayout, perm.lockOnJoin, perm.lockOnJoinConfigurable);
      UserManager.getInstance().getConference().setLockSettings(lockSettings);
      MeetingModel.getInstance().meetingMuted = map.meetingMuted;
      
      UserManager.getInstance().getConference().applyLockSettings();
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
      var l:BBBUser = _conference.getUser(userId);			
      if (l != null) {
        l.listenOnly = listenOnly;
      }	
    }
    
    private function handleVoiceUserMuted(msg:Object):void {    
      var map:Object = JSON.parse(msg.msg);
      var userId:String = map.userId;
      var muted:Boolean = map.muted;

      UsersService.getInstance().userMuted(map);
      
      var l:BBBUser = _conference.getUser(userId);
      if (l != null) {
        l.voiceMuted = muted;
        
        if (l.voiceMuted) {
          // When the user is muted, set the talking flag to false so that the UI will not display the
          // user as talking even if muted.
          userTalk(userId, false);
        }
        
        /**
         * Let's store the voice userid so we can do push to talk.
         */
        if (l.me) {
          _conference.muteMyVoice(l.voiceMuted);
        }				
        
        var bbbEvent:BBBEvent = new BBBEvent(BBBEvent.USER_VOICE_MUTED);
        bbbEvent.payload.muted = muted;
        bbbEvent.payload.userID = l.userID;
        globalDispatcher.dispatchEvent(bbbEvent);    
      }
    }

    private function userTalk(userId:String, talking:Boolean):void {      
      var l:BBBUser = _conference.getUser(userId);			
      if (l != null) {
        l.talking = talking;
        
        var event:CoreEvent = new CoreEvent(EventConstants.USER_TALKING);
        event.message.userID = l.userID;
        event.message.talking = l.talking;
        globalDispatcher.dispatchEvent(event);  
      }	
    }
    
    private function handleVoiceUserTalking(msg:Object):void {   
      var map:Object = JSON.parse(msg.msg); 
      var userId:String = map.userId;
      var talking:Boolean = map.talking;  
      
      UsersService.getInstance().userTalking(map);
      
      userTalk(userId, talking);
    }
    
    private function handleUserLeftVoice(msg:Object):void {  
      LOGGER.debug("*** handleUserLeftVoice " + msg.msg + " **** \n"); 
      var map:Object = JSON.parse(msg.msg);
      
      var webUser:Object = map.user as Object;
      var voiceUser:Object = webUser.voiceUser as Object;
      UsersService.getInstance().userLeftVoice(voiceUser);
      
      var l:BBBUser = _conference.getUser(webUser.userId);
      /**
       * Let's store the voice userid so we can do push to talk.
       */
      if (l != null) {
        if (_conference.getMyUserId() == l.userID) {
          _conference.muteMyVoice(false);
          _conference.setMyVoiceJoined(false);
        }
        
        l.voiceMuted = false;
        l.voiceJoined = false;
        l.talking = false;
        //l.userLocked = false;

        var bbbEvent:BBBEvent = new BBBEvent(BBBEvent.USER_VOICE_LEFT);
        bbbEvent.payload.userID = l.userID;
        globalDispatcher.dispatchEvent(bbbEvent);
        
        if (l.phoneUser) {
          _conference.removeUser(l.userID);
        }
      } else {
        LOGGER.debug("Could not find voice user id[{0}]", [voiceUser.uerId]);
      }
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
      
      UsersService.getInstance().userJoinedVoice(voiceUser);
      
      var externUserID:String = webUser.externUserID;
      var internUserID:String = webUser.userId;
      
      if (UsersUtil.getMyUserID() == internUserID) {
        _conference.muteMyVoice(voiceUser.muted);
        _conference.setMyVoiceJoined(true);
      }
      
      if (UsersUtil.hasUser(internUserID)) {
        var bu:BBBUser = UsersUtil.getUser(internUserID);
        bu.talking = voiceUser.talking;
        bu.voiceMuted = voiceUser.muted;
        bu.voiceJoined = true;
        
        var bbbEvent:BBBEvent = new BBBEvent(BBBEvent.USER_VOICE_JOINED);
        bbbEvent.payload.userID = bu.userID;            
        globalDispatcher.dispatchEvent(bbbEvent);
        
        if (_conference.getLockSettings().getDisableMic() && !bu.voiceMuted && bu.userLocked && bu.me) {
          var ev:VoiceConfEvent = new VoiceConfEvent(VoiceConfEvent.MUTE_USER);
          ev.userid = voiceUser.userId;
          ev.mute = true;
          dispatcher.dispatchEvent(ev);
        }
      }       
    }
    
    public function handleParticipantLeft(msg:Object):void {     
      var map:Object = JSON.parse(msg.msg);
      var webUser:Object = map.user as Object;
      
      var webUserId:String = webUser.userId;
      
      UsersService.getInstance().userLeft(webUser);
      
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
    }
    
    public function handleParticipantJoined(msg:Object):void {
      var map:Object = JSON.parse(msg.msg);
      
      var user:Object = map.user as Object;
      
      UsersService.getInstance().userJoined(user);
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

      // since might be a reconnection, clean up users list
      UserManager.getInstance().getConference().removeAllParticipants();
      
      if (map.count > 0) {
        for(var i:int = 0; i < users.length; i++) {
          var user:Object = users[i] as Object;
          participantJoined(user);
          processUserVoice(user);
        }
        
        UserManager.getInstance().getConference().applyLockSettings();
      }	 
    }
    
    private function processUserVoice(webUser: Object):void {      
      var voiceUser:Object = webUser.voiceUser as Object;

      UsersService.getInstance().userJoinedVoice(voiceUser);
      
      var externUserID:String = webUser.externUserID;
      var internUserID:String = webUser.userId;
      
      if (UsersUtil.getMyExternalUserID() == externUserID) {
        _conference.muteMyVoice(voiceUser.muted);
        _conference.setMyVoiceJoined(voiceUser.joined);
      }
      
      if (UsersUtil.hasUser(internUserID)) {
        var bu:BBBUser = UsersUtil.getUser(internUserID);
        bu.voiceMuted = voiceUser.muted;
        bu.voiceJoined = voiceUser.joined;
        bu.talking = voiceUser.talking;
        //bu.userLocked = voiceUser.locked;
      }       
    }
    
    public function handleAssignPresenterCallback(msg:Object):void {     
      var map:Object = JSON.parse(msg.msg);
      
      var newPresenterID:String = map.newPresenterID;
      var newPresenterName:String = map.newPresenterName;
      var assignedBy:String = map.assignedBy;
      
      var meeting:Conference = UserManager.getInstance().getConference();
      
      if (meeting.amIThisUser(newPresenterID)) {
        sendSwitchedPresenterEvent(true, newPresenterID);
        
        meeting.amIPresenter = true;				
        var e:MadePresenterEvent = new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_PRESENTER_MODE);
        e.userID = newPresenterID;
        e.presenterName = newPresenterName;
        e.assignerBy = assignedBy;
        
        dispatcher.dispatchEvent(e);	
        
      } else {	
        sendSwitchedPresenterEvent(false, newPresenterID);
        
        meeting.amIPresenter = false;
        var viewerEvent:MadePresenterEvent = new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_VIEWER_MODE);
        viewerEvent.userID = newPresenterID;
        viewerEvent.presenterName = newPresenterName;
        viewerEvent.assignerBy = assignedBy;
        
        dispatcher.dispatchEvent(viewerEvent);
      }
    }
    
    private function sendSwitchedPresenterEvent(amIPresenter:Boolean, newPresenterUserID:String):void {
      var roleEvent:SwitchedPresenterEvent = new SwitchedPresenterEvent();
      roleEvent.amIPresenter = amIPresenter;
      roleEvent.newPresenterUserID = newPresenterUserID;
      dispatcher.dispatchEvent(roleEvent);   
    }

    private function handleEmojiStatusHand(msg: Object): void {   
      var map:Object = JSON.parse(msg.msg);      
      UserManager.getInstance().getConference().emojiStatus(map.userId, map.emojiStatus);
        }

    private function handleUserSharedWebcam(msg:Object):void {
        var map:Object = JSON.parse(msg.msg);
        if (!MeetingModel.getInstance().meeting.webcamsOnlyForModerator) {
            UserManager.getInstance().getConference().sharedWebcam(map.userId, map.webcamStream);
        } else if (
			UserManager.getInstance().getConference().amIModerator() || 
			(UserManager.getInstance().getConference().getUser(map.userId) != null && UserManager.getInstance().getConference().getUser(map.userId).role == Role.MODERATOR)
		) {
            UserManager.getInstance().getConference().sharedWebcam(map.userId, map.webcamStream);
        }
    }

    private function handleUserUnsharedWebcam(msg: Object):void {  
	  var map:Object = JSON.parse(msg.msg);
	  
       var logData:Object = UsersUtil.initLogData();
       logData.tags = ["webcam"];
       logData.message = "UserUnsharedWebcam server message";
       logData.user.webcamStream = map.webcamStream;
       logData.user.serverTimestamp = map.serverTimestamp;

	  LOGGER.info(JSON.stringify(logData));
	  
      UserManager.getInstance().getConference().unsharedWebcam(map.userId, map.webcamStream);
	  sendStreamStoppedEvent(map.userId, map.webcamStream);
    }
	
	private function sendStreamStoppedEvent(userId: String, streamId: String):void{
		var dispatcher:Dispatcher = new Dispatcher();
		dispatcher.dispatchEvent(new StreamStoppedEvent(userId, streamId));
	}
    
    public function participantStatusChange(userID:String, status:String, value:Object):void {		
      UserManager.getInstance().getConference().newUserStatus(userID, status, value);
      
      if (status == "presenter"){
        var e:PresenterStatusEvent = new PresenterStatusEvent(PresenterStatusEvent.PRESENTER_NAME_CHANGE);
        e.userID = userID;
        
        dispatcher.dispatchEvent(e);
      }		
    }
    
    public function participantJoined(joinedUser:Object):void {    
      var user:BBBUser = new BBBUser();
      user.userID = joinedUser.userId;
      user.name = joinedUser.name;
      user.role = joinedUser.role;
      user.externUserID = joinedUser.externUserID;
      user.isLeavingFlag = false;
      user.listenOnly = joinedUser.listenOnly;
      user.userLocked = joinedUser.locked;
      user.avatarURL = joinedUser.avatarURL;
	   
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
    }
    
    /**
     * Callback from the server from many of the bellow nc.call methods
     */
    public function handleParticipantStatusChange(msg:Object):void {
      var map:Object = JSON.parse(msg.msg);	
      UserManager.getInstance().getConference().newUserStatus(map.userID, map.status, map.value);
      
      if (msg.status == "presenter"){
        var e:PresenterStatusEvent = new PresenterStatusEvent(PresenterStatusEvent.PRESENTER_NAME_CHANGE);
        e.userID = map.userID;
        
        dispatcher.dispatchEvent(e);
      }		
    }
	
	private function handleBreakoutRoomsList(msg:Object):void{
		var map:Object = JSON.parse(msg.msg);
		for each(var room : Object in map.rooms)
		{
			var breakoutRoom : BreakoutRoom = new BreakoutRoom();
			breakoutRoom.meetingId = room.meetingId;
			breakoutRoom.externalMeetingId = room.externalMeetingId;
			breakoutRoom.name = room.name;
			breakoutRoom.sequence = room.sequence;
			UserManager.getInstance().getConference().addBreakoutRoom(breakoutRoom);
		}
		UserManager.getInstance().getConference().breakoutRoomsReady = map.roomsReady;
	}
	
	private function handleBreakoutRoomJoinURL(msg:Object):void{
		var map:Object = JSON.parse(msg.msg);
		var event : BreakoutRoomEvent = new BreakoutRoomEvent(BreakoutRoomEvent.BREAKOUT_JOIN_URL);
		event.joinURL = map.redirectJoinURL;
		var externalMeetingId : String = StringUtils.substringBetween(event.joinURL, "meetingID=", "&");
		event.breakoutMeetingSequence = UserManager.getInstance().getConference().getBreakoutRoomByExternalId(externalMeetingId).sequence;
		dispatcher.dispatchEvent(event);
	}
	
	private function handleUpdateBreakoutUsers(msg:Object):void{
		var map:Object = JSON.parse(msg.msg);
		UserManager.getInstance().getConference().updateBreakoutRoomUsers(map.breakoutMeetingId, map.users);
	}

	private function handleTimeRemainingUpdate(msg:Object):void {
		var map:Object = JSON.parse(msg.msg);
		var e:BreakoutRoomEvent = new BreakoutRoomEvent(BreakoutRoomEvent.UPDATE_REMAINING_TIME_BREAKOUT);
		e.durationInMinutes = map.timeRemaining;
		dispatcher.dispatchEvent(e);
	}
	
	private function handleBreakoutRoomsTimeRemainingUpdate(msg:Object):void {
		var map:Object = JSON.parse(msg.msg);
		var e:BreakoutRoomEvent = new BreakoutRoomEvent(BreakoutRoomEvent.UPDATE_REMAINING_TIME_PARENT);
		e.durationInMinutes = map.timeRemaining;
		dispatcher.dispatchEvent(e);
	}
	
	private function handleBreakoutRoomStarted(msg:Object):void{
		var map:Object = JSON.parse(msg.msg);	
		var breakoutRoom : BreakoutRoom = new BreakoutRoom();
		breakoutRoom.meetingId = map.breakoutMeetingId;
		breakoutRoom.externalMeetingId = map.externalMeetingId;
		breakoutRoom.name = map.name;
		breakoutRoom.sequence = map.sequence;
		UserManager.getInstance().getConference().addBreakoutRoom(breakoutRoom);
	}
	
	private function handleBreakoutRoomClosed(msg:Object):void{
		var map:Object = JSON.parse(msg.msg);	
		UserManager.getInstance().getConference().removeBreakoutRoom(map.breakoutMeetingId);
	}

  }
}

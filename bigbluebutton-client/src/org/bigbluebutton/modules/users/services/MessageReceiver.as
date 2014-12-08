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
  
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.EventConstants;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.events.CoreEvent;
  import org.bigbluebutton.core.events.VoiceConfEvent;
  import org.bigbluebutton.core.managers.UserManager;
  import org.bigbluebutton.core.model.MeetingModel;
  import org.bigbluebutton.core.model.users.UsersModel;
  import org.bigbluebutton.core.services.UsersService;
  import org.bigbluebutton.core.vo.LockSettings;
  import org.bigbluebutton.core.vo.LockSettingsVO;
  import org.bigbluebutton.main.events.BBBEvent;
  import org.bigbluebutton.main.events.MadePresenterEvent;
  import org.bigbluebutton.main.events.PresenterStatusEvent;
  import org.bigbluebutton.main.events.SwitchedPresenterEvent;
  import org.bigbluebutton.main.events.UserJoinedEvent;
  import org.bigbluebutton.main.events.UserLeftEvent;
  import org.bigbluebutton.main.model.users.BBBUser;
  import org.bigbluebutton.main.model.users.Conference;
  import org.bigbluebutton.main.model.users.IMessageListener;
  import org.bigbluebutton.main.model.users.events.RoleChangeEvent;
  import org.bigbluebutton.main.model.users.events.UsersConnectionEvent;
  import org.bigbluebutton.modules.present.events.CursorEvent;
  import org.bigbluebutton.modules.present.events.NavigationEvent;
  import org.bigbluebutton.modules.present.events.RemovePresentationEvent;
  import org.bigbluebutton.modules.present.events.UploadEvent;
  import org.bigbluebutton.modules.users.events.MeetingMutedEvent;
  
  public class MessageReceiver implements IMessageListener
  {
    private static const LOG:String = "Users::MessageReceiver - ";
       
    private var dispatcher:Dispatcher;
    private var _conference:Conference;
    private static var globalDispatcher:Dispatcher = new Dispatcher();
    
    public function MessageReceiver() {
      _conference = UserManager.getInstance().getConference();
      BBB.initConnectionManager().addMessageListener(this);
      this.dispatcher = new Dispatcher();
    }
    
    public function onMessage(messageName:String, message:Object):void {
//      trace(LOG + " received message " + messageName);
      
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
        case "userRaisedHand":
          handleUserRaisedHand(message);
          break;
        case "userLoweredHand":
          handleUserLoweredHand(message);
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
      }
    }  
    
    private function handleMeetingHasEnded(msg: Object):void {
      trace(LOG + "*** handleMeetingHasEnded " + msg.msg + " **** \n"); 
    }
    
    private function handlePermissionsSettingsChanged(msg:Object):void {
      trace(LOG + "*** handlePermissionsSettingsChanged " + msg.msg + " **** \n");
      var map:Object = JSON.parse(msg.msg);
      var lockSettings:LockSettingsVO = new LockSettingsVO(map.disableCam,
                                                           map.disableMic,
                                                           map.disablePrivChat,
                                                           map.disablePubChat,
                                                           map.lockedLayout);
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
      trace(LOG + "*** handleJoinedMeeting " + msg.msg + " **** \n");      
      var map:Object = JSON.parse(msg.msg);
      var userid: String = map.user.userId;
      
      var e:UsersConnectionEvent = new UsersConnectionEvent(UsersConnectionEvent.CONNECTION_SUCCESS);
      e.userid = userid;
      dispatcher.dispatchEvent(e);      
    }
    
    private function handleMeetingMuted(msg:Object):void {
      trace(LOG + "*** handleMeetingMuted " + msg.msg + " **** \n");
      var map:Object = JSON.parse(msg.msg);
      if (map.hasOwnProperty("meetingMuted")) {
        MeetingModel.getInstance().meetingMuted = map.meetingMuted;
        dispatcher.dispatchEvent(new MeetingMutedEvent());
      }
    }
    
    private function handleMeetingState(msg:Object):void {
      trace(LOG + "*** handleMeetingState " + msg.msg + " **** \n");
      var map:Object = JSON.parse(msg.msg);  
      var perm:Object = map.permissions;
      
      var lockSettings:LockSettingsVO = new LockSettingsVO(perm.disableCam, perm.disableMic,
                                                 perm.disablePrivChat, perm.disablePubChat, perm.lockedLayout);
      UserManager.getInstance().getConference().setLockSettings(lockSettings);
      MeetingModel.getInstance().meetingMuted = map.meetingMuted;
      
      UserManager.getInstance().getConference().applyLockSettings();
    }
    
    private function handleGetRecordingStatusReply(msg: Object):void {
      trace(LOG + "*** handleGetRecordingStatusReply " + msg.msg + " **** \n");      
      var map:Object = JSON.parse(msg.msg);
      sendRecordingStatusUpdate(map.recording);      
    }
    
    private function handleRecordingStatusChanged(msg: Object):void {
      trace(LOG + "*** handleRecordingStatusChanged " + msg.msg + " **** \n");      
      var map:Object = JSON.parse(msg.msg);
      sendRecordingStatusUpdate(map.recording);
    }
    
    private function handleUserListeningOnly(msg: Object):void {
      trace(LOG + "*** handleUserListeningOnly " + msg.msg + " **** \n");      
      var map:Object = JSON.parse(msg.msg);  
      var userId:String = map.userId;
      var listenOnly:Boolean = map.listenOnly;
      var l:BBBUser = _conference.getUser(userId);			
      if (l != null) {
        l.listenOnly = listenOnly;
      }	
    }
    
    private function handleVoiceUserMuted(msg:Object):void {
      trace(LOG + "*** handleVoiceUserMuted " + msg.msg + " **** \n");      
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
        
        LogUtil.debug("[" + l.name + "] is now muted=[" + l.voiceMuted + "]");
        
        var bbbEvent:BBBEvent = new BBBEvent(BBBEvent.USER_VOICE_MUTED);
        bbbEvent.payload.muted = muted;
        bbbEvent.payload.userID = l.userID;
        globalDispatcher.dispatchEvent(bbbEvent);    
      }
    }

    private function userTalk(userId:String, talking:Boolean):void {      
      trace("User talking event");
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
      trace(LOG + "*** handleVoiceUserTalking " + msg.msg + " **** \n");      
      var map:Object = JSON.parse(msg.msg); 
      var userId:String = map.userId;
      var talking:Boolean = map.talking;  
      
      UsersService.getInstance().userTalking(map);
      
      userTalk(userId, talking);
    }
    
    private function handleUserLeftVoice(msg:Object):void {
      trace(LOG + "*** handleUserLeftVoice " + msg.msg + " **** \n");      
      var map:Object = JSON.parse(msg.msg);
      
      var webUser:Object = map.user as Object;
      var voiceUser:Object = webUser.voiceUser as Object;
      UsersService.getInstance().userLeftVoice(voiceUser);
      
      var l:BBBUser = _conference.getUser(webUser.userId);
      /**
       * Let's store the voice userid so we can do push to talk.
       */
      if (l != null) {
        trace(LOG + "Found voice user id[" + voiceUser.userId + "]");
        if (_conference.getMyUserId() == l.userID) {
          trace(LOG + "I am this voice user id[" + voiceUser.userId + "]");
          _conference.muteMyVoice(false);
          _conference.setMyVoiceJoined(false);
        }
        
        l.voiceMuted = false;
        l.voiceJoined = false;
        l.talking = false;
        l.userLocked = false;
        
        trace(LOG + "notifying views that user has left voice. id[" + voiceUser.userId + "]");
        var bbbEvent:BBBEvent = new BBBEvent(BBBEvent.USER_VOICE_LEFT);
        bbbEvent.payload.userID = l.userID;
        globalDispatcher.dispatchEvent(bbbEvent);
        
        if (l.phoneUser) {
          _conference.removeUser(l.userID);
        }
      } else {
        trace(LOG + "Could not find voice user id" + voiceUser.userId + "]");
      }
    }
    
    private function handleUserJoinedVoice(msg:Object):void {
      trace(LOG + "*** handleUserJoinedVoice " + msg.msg + " **** \n");
      var map:Object = JSON.parse(msg.msg);
      var webUser:Object = map.user as Object;
      userJoinedVoice(webUser);

      return;
    }
    
    private function userJoinedVoice(webUser: Object):void {      
      var voiceUser:Object = webUser.voiceUser as Object;
      
      UsersService.getInstance().userJoinedVoice(voiceUser);
      
      var externUserID:String = webUser.externUserID;
      var internUserID:String = UsersUtil.externalUserIDToInternalUserID(externUserID);
      
      if (UsersUtil.getMyExternalUserID() == externUserID) {
        _conference.muteMyVoice(voiceUser.muted);
        _conference.setMyVoiceJoined(true);
      }
      
      if (UsersUtil.hasUser(internUserID)) {
        var bu:BBBUser = UsersUtil.getUser(internUserID);
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
      trace(LOG + "*** handleParticipantLeft " + msg.msg + " **** \n");      
      var map:Object = JSON.parse(msg.msg);
      var webUser:Object = map.user as Object;
      
      var webUserId:String = webUser.userId;
      
      UsersService.getInstance().userLeft(webUser);
      
      var user:BBBUser = UserManager.getInstance().getConference().getUser(webUserId);
      
      trace(LOG + "Notify others that user [" + user.userID + ", " + user.name + "] is leaving!!!!");
      
      // Flag that the user is leaving the meeting so that apps (such as avatar) doesn't hang
      // around when the user already left.
      user.isLeavingFlag = true;
      
      var joinEvent:UserLeftEvent = new UserLeftEvent(UserLeftEvent.LEFT);
      joinEvent.userID = user.userID;
      dispatcher.dispatchEvent(joinEvent);	
      
      UserManager.getInstance().getConference().removeUser(webUserId);	        
    }
    
    public function handleParticipantJoined(msg:Object):void {
      trace(LOG + "*** handleParticipantJoined " + msg.msg + " **** \n");      
      var map:Object = JSON.parse(msg.msg);
      
      var user:Object = map.user as Object;
      
      UsersService.getInstance().userJoined(user);
      trace(LOG + "*** handleParticipantJoined [" + user.userId + "] **** \n");
      participantJoined(user);
    }
    
    /**
     * Called by the server to tell the client that the meeting has ended.
     */
    public function handleLogout(msg:Object):void {     
      var endMeetingEvent:BBBEvent = new BBBEvent(BBBEvent.END_MEETING_EVENT);
      dispatcher.dispatchEvent(endMeetingEvent);
    }
    
    private function handleGetUsersReply(msg:Object):void {
      trace(LOG + "*** handleGetUsersReply " + msg.msg + " **** \n");      
      var map:Object = JSON.parse(msg.msg);
      var users:Object = map.users as Array;
      
      if (map.count > 0) {
        trace(LOG + "number of users = [" + users.length + "]");
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
      var internUserID:String = UsersUtil.externalUserIDToInternalUserID(externUserID);
      
      if (UsersUtil.getMyExternalUserID() == externUserID) {
        _conference.muteMyVoice(voiceUser.muted);
        _conference.setMyVoiceJoined(voiceUser.joined);
      }
      
      if (UsersUtil.hasUser(internUserID)) {
        var bu:BBBUser = UsersUtil.getUser(internUserID);
        bu.voiceMuted = voiceUser.muted;
        bu.voiceJoined = voiceUser.joined;
        bu.talking = voiceUser.talking;
        bu.userLocked = voiceUser.locked;
      }       
    }
    
    public function handleAssignPresenterCallback(msg:Object):void {
      trace(LOG + "*** handleAssignPresenterCallback " + msg.msg + " **** \n");      
      var map:Object = JSON.parse(msg.msg);
      
      var newPresenterID:String = map.newPresenterID;
      var newPresenterName:String = map.newPresenterName;
      var assignedBy:String = map.assignedBy;
      
      trace(LOG + "**** assignPresenterCallback [" + newPresenterID + "," + newPresenterName + "," + assignedBy + "]");
      
      var meeting:Conference = UserManager.getInstance().getConference();
      
      if (meeting.amIThisUser(newPresenterID)) {
        trace(LOG + "**** Switching [" + newPresenterName + "] to presenter");
        sendSwitchedPresenterEvent(true, newPresenterID);
        
        meeting.amIPresenter = true;				
        var e:MadePresenterEvent = new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_PRESENTER_MODE);
        e.userID = newPresenterID;
        e.presenterName = newPresenterName;
        e.assignerBy = assignedBy;
        
        dispatcher.dispatchEvent(e);	
        
      } else {	
        trace(LOG + "**** Switching [" + newPresenterName + "] to presenter. I am viewer.");
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

    private function handleUserRaisedHand(msg: Object): void {
      trace(LOG + "*** handleUserRaisedHand " + msg.msg + " **** \n");      
      var map:Object = JSON.parse(msg.msg);      
      UserManager.getInstance().getConference().raiseHand(map.userId, true);
    }

    private function handleUserLoweredHand(msg: Object):void {
      trace(LOG + "*** handleUserLoweredHand " + msg.msg + " **** \n");      
      var map:Object = JSON.parse(msg.msg);      
      UserManager.getInstance().getConference().raiseHand(map.userId, false);
    }

    private function handleUserSharedWebcam(msg: Object):void {
      trace(LOG + "*** handleUserSharedWebcam " + msg.msg + " **** \n");      
      var map:Object = JSON.parse(msg.msg);
      UserManager.getInstance().getConference().sharedWebcam(map.userId, map.webcamStream);
    }

    private function handleUserUnsharedWebcam(msg: Object):void {
      trace(LOG + "*** handleUserUnsharedWebcam " + msg.msg + " **** \n");      
      var map:Object = JSON.parse(msg.msg);      
      UserManager.getInstance().getConference().unsharedWebcam(map.userId);
    }
    
    public function participantStatusChange(userID:String, status:String, value:Object):void {
      trace(LOG + "Received status change [" + userID + "," + status + "," + value + "]")			
      UserManager.getInstance().getConference().newUserStatus(userID, status, value);
      
      if (status == "presenter"){
        var e:PresenterStatusEvent = new PresenterStatusEvent(PresenterStatusEvent.PRESENTER_NAME_CHANGE);
        e.userID = userID;
        
        dispatcher.dispatchEvent(e);
      }		
    }
    
    public function participantJoined(joinedUser:Object):void {      
      trace(LOG + "*** participantJoined [" + joinedUser.userId + "] **** \n");
      var user:BBBUser = new BBBUser();
      user.userID = joinedUser.userId;
      user.name = joinedUser.name;
      user.role = joinedUser.role;
      user.externUserID = joinedUser.externUserID;
      user.isLeavingFlag = false;
      user.listenOnly = joinedUser.listenOnly;
      
      trace(LOG + "User status: hasStream " + joinedUser.hasStream);
      
      trace(LOG + "Joined as [" + user.userID + "," + user.name + "," + user.role + "," + joinedUser.hasStream + "]");
      UserManager.getInstance().getConference().addUser(user);
      
      if (joinedUser.hasStream) {
        UserManager.getInstance().getConference().sharedWebcam(user.userID, joinedUser.webcamStream);
      } else {
        UserManager.getInstance().getConference().unsharedWebcam(user.userID);
      }
      
      UserManager.getInstance().getConference().presenterStatusChanged(user.userID, joinedUser.presenter);
      UserManager.getInstance().getConference().raiseHand(user.userID, joinedUser.raiseHand);
           
      var joinEvent:UserJoinedEvent = new UserJoinedEvent(UserJoinedEvent.JOINED);
      joinEvent.userID = user.userID;
      dispatcher.dispatchEvent(joinEvent);	
   
    }
    
    /**
     * Callback from the server from many of the bellow nc.call methods
     */
    public function handleParticipantStatusChange(msg:Object):void {
      trace(LOG + "*** handleParticipantStatusChange " + msg.msg + " **** \n");      
      var map:Object = JSON.parse(msg.msg);
      
      trace(LOG + "Received status change [" + map.userID + "," + map.status + "," + map.value + "]")			
      UserManager.getInstance().getConference().newUserStatus(map.userID, map.status, map.value);
      
      if (msg.status == "presenter"){
        var e:PresenterStatusEvent = new PresenterStatusEvent(PresenterStatusEvent.PRESENTER_NAME_CHANGE);
        e.userID = map.userID;
        
        dispatcher.dispatchEvent(e);
      }		
    }
  }
}
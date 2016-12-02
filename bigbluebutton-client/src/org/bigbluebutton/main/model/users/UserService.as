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
package org.bigbluebutton.main.model.users
{
	import com.asfusion.mate.events.Dispatcher;	
	import flash.external.ExternalInterface;
	import flash.net.NetConnection;	
	import mx.collections.ArrayCollection;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.events.LockControlEvent;
	import org.bigbluebutton.core.events.VoiceConfEvent;
	import org.bigbluebutton.core.managers.ConnectionManager;
	import org.bigbluebutton.core.managers.UserConfigManager;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.core.model.Config;
	import org.bigbluebutton.main.events.BBBEvent;
	import org.bigbluebutton.main.events.BreakoutRoomEvent;
	import org.bigbluebutton.main.events.SuccessfulLoginEvent;
	import org.bigbluebutton.main.events.UserServicesEvent;
	import org.bigbluebutton.main.model.ConferenceParameters;
	import org.bigbluebutton.main.model.users.events.BroadcastStartedEvent;
	import org.bigbluebutton.main.model.users.events.BroadcastStoppedEvent;
	import org.bigbluebutton.main.model.users.events.ConferenceCreatedEvent;
	import org.bigbluebutton.main.model.users.events.EmojiStatusEvent;
	import org.bigbluebutton.main.model.users.events.KickUserEvent;
	import org.bigbluebutton.main.model.users.events.RoleChangeEvent;
	import org.bigbluebutton.main.model.users.events.UsersConnectionEvent;
	import org.bigbluebutton.modules.users.services.MessageReceiver;
	import org.bigbluebutton.modules.users.services.MessageSender;

	public class UserService {
		private static const LOGGER:ILogger = getClassLogger(UserService);      
    
		private var joinService:JoinService;
		private var _conferenceParameters:ConferenceParameters;		
		private var applicationURI:String;
		private var hostURI:String;		
		private var connection:NetConnection;
		private var dispatcher:Dispatcher;
		
    private var _connectionManager:ConnectionManager;
    private var msgReceiver:MessageReceiver = new MessageReceiver();
    private var sender:MessageSender = new MessageSender();
    
		public function UserService() {
			dispatcher = new Dispatcher();
		}
		
		public function startService(e:UserServicesEvent):void {      
			joinService = new JoinService();
			joinService.addJoinResultListener(joinListener);
			joinService.load(BBB.getConfigManager().config.application.host);
		}
		
		private function joinListener(success:Boolean, result:Object):void {
			if (success) {
				var config:Config = BBB.getConfigManager().config;
				
				UserManager.getInstance().getConference().setMyName(result.username);
				UserManager.getInstance().getConference().setMyRole(result.role);
				UserManager.getInstance().getConference().setMyRoom(result.room);
				UserManager.getInstance().getConference().setMyAuthToken(result.authToken);
				UserManager.getInstance().getConference().setMyCustomData(result.customdata);
				UserManager.getInstance().getConference().setDefaultLayout(result.defaultLayout);
				
				UserManager.getInstance().getConference().setMyUserid(result.internalUserId);
				
				UserManager.getInstance().getConference().externalMeetingID = result.externMeetingID;
				UserManager.getInstance().getConference().isBreakout = result.isBreakout;
				UserManager.getInstance().getConference().meetingName = result.conferenceName;
				UserManager.getInstance().getConference().internalMeetingID = result.room;
				UserManager.getInstance().getConference().externalUserID = result.externUserID;
				UserManager.getInstance().getConference().avatarURL = result.avatarURL;
				UserManager.getInstance().getConference().voiceBridge = result.voicebridge;
				UserManager.getInstance().getConference().dialNumber = result.dialnumber;
				UserManager.getInstance().getConference().record = (result.record.toUpperCase() == "TRUE");
				
        
        
				_conferenceParameters = new ConferenceParameters();
				_conferenceParameters.meetingName = result.conferenceName;
				_conferenceParameters.externMeetingID = result.externMeetingID;
				_conferenceParameters.isBreakout = result.isBreakout;
				_conferenceParameters.conference = result.conference;
				_conferenceParameters.username = result.username;
				_conferenceParameters.role = result.role;
				_conferenceParameters.room = result.room;
        _conferenceParameters.authToken = result.authToken;
				_conferenceParameters.webvoiceconf = result.webvoiceconf;
				_conferenceParameters.voicebridge = result.voicebridge;
				_conferenceParameters.welcome = result.welcome;
				_conferenceParameters.meetingID = result.meetingID;
				_conferenceParameters.externUserID = result.externUserID;
				_conferenceParameters.internalUserID = result.internalUserId;
				_conferenceParameters.logoutUrl = result.logoutUrl;
				_conferenceParameters.record = (result.record != "false");
				
				var muteOnStart:Boolean;
				try {
					muteOnStart = (config.meeting.@muteOnStart.toUpperCase() == "TRUE");
				} catch(e:Error) {
					muteOnStart = false;
				}
				
				_conferenceParameters.muteOnStart = muteOnStart;
				_conferenceParameters.lockSettings = UserManager.getInstance().getConference().getLockSettings().toMap();
				
				// assign the meeting name to the document title
				ExternalInterface.call("setTitle", _conferenceParameters.meetingName);
				
				/**
				 * Temporarily store the parameters in global BBB so we get easy access to it.
				 */
				var ucm:UserConfigManager = BBB.initUserConfigManager();
				ucm.setConferenceParameters(_conferenceParameters);
				var e:ConferenceCreatedEvent = new ConferenceCreatedEvent(ConferenceCreatedEvent.CONFERENCE_CREATED_EVENT);
				e.conference = UserManager.getInstance().getConference();
				dispatcher.dispatchEvent(e);
				
				connect();
			}
		}
		
    private function connect():void{
      _connectionManager = BBB.initConnectionManager();
      _connectionManager.connect();
    }
	
    public function logoutUser():void {
      disconnect(true);
    }
    
    public function disconnect(onUserAction:Boolean):void {
      _connectionManager.disconnect(onUserAction);
		}
		
		private function queryForRecordingStatus():void {
			sender.queryForRecordingStatus();
		}

		public function changeRecordingStatus(e:BBBEvent):void {
			if (this.isModerator() && !e.payload.remote) {
				var myUserId:String = UserManager.getInstance().getConference().getMyUserId();
				sender.changeRecordingStatus(myUserId, e.payload.recording);
			}
		}

		public function userLoggedIn(e:UsersConnectionEvent):void {
			UserManager.getInstance().getConference().setMyUserid(e.userid);
			_conferenceParameters.userid = e.userid;
			sender.queryForParticipants();
			sender.queryForRecordingStatus();
			if (!_conferenceParameters.isBreakout) {
				sender.queryForBreakoutRooms(_conferenceParameters.meetingID);
			}
			var loadCommand:SuccessfulLoginEvent = new SuccessfulLoginEvent(SuccessfulLoginEvent.USER_LOGGED_IN);
			loadCommand.conferenceParameters = _conferenceParameters;
			dispatcher.dispatchEvent(loadCommand);
		}

		public function isModerator():Boolean {
			return UserManager.getInstance().getConference().amIModerator();
		}
		
		public function get participants():ArrayCollection {
			return UserManager.getInstance().getConference().users;
		}
				
		public function addStream(e:BroadcastStartedEvent):void {
      sender.addStream(e.userid, e.stream);
		}
		
		public function removeStream(e:BroadcastStoppedEvent):void {			
      sender.removeStream(e.userid, e.stream);
		}
		
		public function emojiStatus(e:EmojiStatusEvent):void {
			// If the userId is not set in the event then the event has been dispatched for the current user
			sender.emojiStatus(e.userId != "" ? e.userId : UserManager.getInstance().getConference().getMyUserId(), e.status);
		}
		
		public function createBreakoutRooms(e:BreakoutRoomEvent):void{
			sender.createBreakoutRooms(_conferenceParameters.meetingID, e.rooms, e.durationInMinutes, e.record);
		}
		
		public function requestBreakoutJoinUrl(e:BreakoutRoomEvent):void{
			sender.requestBreakoutJoinUrl(_conferenceParameters.meetingID, e.breakoutMeetingId, e.userId);
		}
		
		public function listenInOnBreakout(e:BreakoutRoomEvent):void {
			if (e.listen) {
				sender.listenInOnBreakout(_conferenceParameters.meetingID, e.breakoutMeetingId, _conferenceParameters.userid);
			} else {
				sender.listenInOnBreakout(e.breakoutMeetingId, _conferenceParameters.meetingID, _conferenceParameters.userid);
			}
			UserManager.getInstance().getConference().setBreakoutRoomInListen(e.listen, e.breakoutMeetingId);
		}

		public function endAllBreakoutRooms(e:BreakoutRoomEvent):void {
			sender.endAllBreakoutRooms(_conferenceParameters.meetingID);
		}

		public function kickUser(e:KickUserEvent):void{
			if (this.isModerator()) sender.kickUser(e.userid);
		}
		
		/**
		 * Assign a new presenter 
		 * @param e
		 * 
		 */		
		public function assignPresenter(e:RoleChangeEvent):void{
			var assignTo:String = e.userid;
			var name:String = e.username;
      sender.assignPresenter(assignTo, name, 1);
		}

    public function muteUnmuteUser(command:VoiceConfEvent):void {
      sender.muteUnmuteUser(command.userid, command.mute);		
    }
    
    public function muteAllUsers(command:VoiceConfEvent):void {	
      sender.muteAllUsers(true);			
    }
    
    public function unmuteAllUsers(command:VoiceConfEvent):void{
      sender.muteAllUsers(false);
    }
       
    public function muteAllUsersExceptPresenter(command:VoiceConfEvent):void {	
      sender.muteAllUsersExceptPresenter(true);
    }
        
    public function ejectUser(command:VoiceConfEvent):void {
      sender.ejectUser(command.userid);			
    }	
    
    //Lock events
    public function lockAllUsers(command:LockControlEvent):void {
      sender.setAllUsersLock(true);			
    }
    
    public function unlockAllUsers(command:LockControlEvent):void {	
      sender.setAllUsersLock(false);			
    }
    
    public function lockAlmostAllUsers(command:LockControlEvent):void {	
      var pres:BBBUser = UserManager.getInstance().getConference().getPresenter();
      sender.setAllUsersLock(true, [pres.userID]);
    }
    
    public function lockUser(command:LockControlEvent):void {	
      sender.setUserLock(command.internalUserID, true);			
    }
    
    public function unlockUser(command:LockControlEvent):void {	
      sender.setUserLock(command.internalUserID, false);			
    }
    
    public function saveLockSettings(command:LockControlEvent):void {	
      sender.saveLockSettings(command.payload);			
    }
	}
}

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
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.Options;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.core.events.LockControlEvent;
	import org.bigbluebutton.core.events.TokenValidEvent;
	import org.bigbluebutton.core.events.TokenValidReconnectEvent;
	import org.bigbluebutton.core.events.VoiceConfEvent;
	import org.bigbluebutton.core.managers.ConnectionManager;
	import org.bigbluebutton.core.model.LiveMeeting;
	import org.bigbluebutton.main.events.BBBEvent;
	import org.bigbluebutton.main.events.BreakoutRoomEvent;
	import org.bigbluebutton.main.events.LogoutEvent;
	import org.bigbluebutton.main.events.ResponseModeratorEvent;
	import org.bigbluebutton.main.events.SuccessfulLoginEvent;
	import org.bigbluebutton.main.events.UserServicesEvent;
	import org.bigbluebutton.main.model.options.ApplicationOptions;
	import org.bigbluebutton.main.model.users.events.BroadcastStartedEvent;
	import org.bigbluebutton.main.model.users.events.BroadcastStoppedEvent;
	import org.bigbluebutton.main.model.users.events.ChangeRoleEvent;
	import org.bigbluebutton.main.model.users.events.ConferenceCreatedEvent;
	import org.bigbluebutton.main.model.users.events.EmojiStatusEvent;
	import org.bigbluebutton.main.model.users.events.KickUserEvent;
	import org.bigbluebutton.main.model.users.events.RoleChangeEvent;
	import org.bigbluebutton.main.model.users.events.UsersConnectionEvent;
	import org.bigbluebutton.modules.users.events.MeetingMutedEvent;
	import org.bigbluebutton.modules.users.services.MessageReceiver;
	import org.bigbluebutton.modules.users.services.MessageSender;

	public class UserService {
		private static const LOGGER:ILogger = getClassLogger(UserService);      
    
		private var joinService:JoinService;
		private var applicationURI:String;
		private var hostURI:String;		
		private var connection:NetConnection;
		private var dispatcher:Dispatcher;
		private var reconnecting:Boolean = false;
		
    private var _connectionManager:ConnectionManager;
    private var msgReceiver:MessageReceiver = new MessageReceiver();
    private var sender:MessageSender = new MessageSender();
    
		public function UserService() {
			dispatcher = new Dispatcher();
			msgReceiver.onAllowedToJoin = function():void {
				onAllowedToJoin();
			}
		}

		private function onAllowedToJoin():void {
			sender.queryForParticipants();
			sender.queryForRecordingStatus();
			sender.queryForGuestPolicy();
			sender.queryForGuestsWaiting();
			sender.getLockSettings();
			sender.getRoomMuteState();

			if (!LiveMeeting.inst().meeting.isBreakout) {
				sender.queryForBreakoutRooms(LiveMeeting.inst().meeting.internalId);
			}

			var loadCommand:SuccessfulLoginEvent = new SuccessfulLoginEvent(SuccessfulLoginEvent.USER_LOGGED_IN);
			dispatcher.dispatchEvent(loadCommand);
		}
		
		public function startService(e:UserServicesEvent):void {      
			joinService = new JoinService();
			joinService.addJoinResultListener(joinListener);
			var applicationOptions : ApplicationOptions = Options.getOptions(ApplicationOptions) as ApplicationOptions;
			joinService.load(applicationOptions.host);
		}
		
		private function joinListener(success:Boolean, result: EnterApiResponse):void {
			if (success) {        

        LiveMeeting.inst().me.id = result.intUserId
        LiveMeeting.inst().me.name = result.username;
        LiveMeeting.inst().me.externalId = result.extUserId;
        LiveMeeting.inst().me.authToken = result.authToken;
        LiveMeeting.inst().me.layout = result.defaultLayout;
				LiveMeeting.inst().me.logoutURL = result.logoutUrl;
        LiveMeeting.inst().me.role = result.role;
        LiveMeeting.inst().me.welcome = result.welcome;
        LiveMeeting.inst().me.avatarURL = result.avatarURL;
        LiveMeeting.inst().me.dialNumber = result.dialnumber;
        
        LiveMeeting.inst().me.guest = result.guest;
        LiveMeeting.inst().me.authed = result.authed;
        LiveMeeting.inst().me.customData = result.customdata;
        
        LiveMeeting.inst().meeting.name = result.meetingName;
        LiveMeeting.inst().meeting.internalId = result.intMeetingId;
        LiveMeeting.inst().meeting.externalId =  result.extMeetingId;
        LiveMeeting.inst().meeting.isBreakout = result.isBreakout;
        LiveMeeting.inst().meeting.defaultAvatarUrl = result.avatarURL;
        LiveMeeting.inst().meeting.voiceConf = result.voiceConf;
        LiveMeeting.inst().meeting.dialNumber = result.dialnumber;
        LiveMeeting.inst().meeting.recorded = result.record;
        LiveMeeting.inst().meeting.defaultLayout = result.defaultLayout;
        LiveMeeting.inst().meeting.welcomeMessage = result.welcome;
        LiveMeeting.inst().meeting.modOnlyMessage = result.modOnlyMessage;
        LiveMeeting.inst().meeting.allowStartStopRecording = result.allowStartStopRecording;
        LiveMeeting.inst().meeting.webcamsOnlyForModerator = result.webcamsOnlyForModerator;
        LiveMeeting.inst().meeting.metadata = result.metadata;
        
		LiveMeeting.inst().meeting.logoutTimer = result.logoutTimer;
		
		LiveMeeting.inst().meeting.bannerColor = result.bannerColor;
		LiveMeeting.inst().meeting.bannerText = result.bannerText;

        LiveMeeting.inst().meeting.muteOnStart = result.muteOnStart;
				LiveMeeting.inst().meetingStatus.isMeetingMuted = result.muteOnStart;
        LiveMeeting.inst().meeting.customLogo = result.customLogo;
				LiveMeeting.inst().meeting.customCopyright = result.customCopyright;
				
				// assign the meeting name to the document title
				ExternalInterface.call("setTitle", result.meetingName);
				
				var e:ConferenceCreatedEvent = new ConferenceCreatedEvent(ConferenceCreatedEvent.CONFERENCE_CREATED_EVENT);
				dispatcher.dispatchEvent(e);
				
				// Send event to trigger meeting muted initialization of meeting (ralam dec 21, 2017)
				dispatcher.dispatchEvent(new MeetingMutedEvent());
				connect();
			}
		}


		
    private function connect():void{
      _connectionManager = BBB.initConnectionManager();
      _connectionManager.connect();
    }
	
    public function tokenValidEventHandler(event: TokenValidEvent): void {
      sender.joinMeeting();
    }

    public function tokenValidReconnectEventHandler(event: TokenValidReconnectEvent): void {
      sender.joinMeetingAfterReconnect();
    }

	public function logoutEndMeeting():void{
		if (this.isModerator()) {
			var myUserId: String = UsersUtil.getMyUserID();
			sender.logoutEndMeeting(myUserId);
		}
	}

    public function logoutUser():void {
      disconnect(true);
    }
    
    public function disconnect(onUserAction:Boolean):void {
		if (_connectionManager) {
	      _connectionManager.disconnect(onUserAction);
		}
	}

		public function activityResponse():void {
			sender.activityResponse();
		}
		
		private function queryForRecordingStatus():void {
			sender.queryForRecordingStatus();
		}

		public function changeRecordingStatus(e:BBBEvent):void {
			if (this.isModerator() && !e.payload.remote) {
				var myUserId:String = UsersUtil.getMyUserID();
				sender.changeRecordingStatus(myUserId, e.payload.recording);
			}
		}

		public function userLoggedIn(e:UsersConnectionEvent):void {
      LOGGER.debug("In userLoggedIn - reconnecting and allowed to join");
			if (reconnecting && ! LiveMeeting.inst().me.waitingForApproval) {
				LOGGER.debug("userLoggedIn - reconnecting and allowed to join");
				onAllowedToJoin();
				reconnecting = false;
			} else {
        onAllowedToJoin();

      }
		}

		public function denyGuest():void {
			dispatcher.dispatchEvent(new LogoutEvent(LogoutEvent.MODERATOR_DENIED_ME));
		}

		public function setGuestPolicy(event:BBBEvent):void {
			sender.setGuestPolicy(event.payload['guestPolicy']);
		}

		public function guestDisconnect():void {
			_connectionManager.guestDisconnect();
		}

		public function isModerator():Boolean {
			return UsersUtil.amIModerator();
		}
				
		public function addStream(e:BroadcastStartedEvent):void {
      sender.addStream(e.userid, e.stream);
		}
		
		public function removeStream(e:BroadcastStoppedEvent):void {			
      sender.removeStream(e.userid, e.stream);
		}
		
		public function emojiStatus(e:EmojiStatusEvent):void {
			// If the userId is not set in the event then the event has been dispatched for the current user
			sender.emojiStatus(e.userId != "" ? e.userId : UsersUtil.getMyUserID(), e.status);
		}
		
		public function createBreakoutRooms(e:BreakoutRoomEvent):void{
			sender.createBreakoutRooms(LiveMeeting.inst().meeting.internalId, e.rooms, e.durationInMinutes, e.record);
		}
    
    public function handleApproveGuestAccess(e: ResponseModeratorEvent):void {
      sender.approveGuestAccess(e.userIds, e.allow);
    }
		
		public function requestBreakoutJoinUrl(e:BreakoutRoomEvent):void{
			sender.requestBreakoutJoinUrl(LiveMeeting.inst().meeting.internalId, e.breakoutMeetingId, e.userId);
		}
		
		public function listenInOnBreakout(e:BreakoutRoomEvent):void {
			if (e.listen) {
				sender.listenInOnBreakout(LiveMeeting.inst().meeting.internalId, 
          e.breakoutMeetingId, LiveMeeting.inst().me.id);
			} else {
				sender.listenInOnBreakout(e.breakoutMeetingId, LiveMeeting.inst().meeting.internalId, LiveMeeting.inst().me.id);
			}
			LiveMeeting.inst().breakoutRooms.setBreakoutRoomInListen(e.listen, e.breakoutMeetingId);
		}

		public function endAllBreakoutRooms(e:BreakoutRoomEvent):void {
			sender.endAllBreakoutRooms(LiveMeeting.inst().meeting.internalId);
		}

		public function kickUser(e:KickUserEvent):void{
			if (this.isModerator()) sender.kickUser(e.userid);
		}

		public function changeRole(e:ChangeRoleEvent):void {
			if (this.isModerator()) sender.changeRole(e.userid, e.role);
		}

		public function onReconnecting(e:BBBEvent):void {
			if (e.payload.type == "BIGBLUEBUTTON_CONNECTION") {
				LOGGER.debug("onReconnecting");
				reconnecting = true;
			}
		}
		
		/**
		 * Assign a new presenter 
		 * @param e
		 * 
		 */		
		public function assignPresenter(e:RoleChangeEvent):void{
			var assignTo:String = e.userid;
			var name:String = e.username;
			sender.assignPresenter(assignTo, name, UsersUtil.getMyUserID());
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
      if (this.isModerator()) sender.ejectUserFromVoice(command.userid);
    }
    
    //Lock events
    public function lockAllUsers(command:LockControlEvent):void {
      sender.setAllUsersLock(true);			
    }
    
    public function unlockAllUsers(command:LockControlEvent):void {	
      sender.setAllUsersLock(false);			
    }
    
    public function lockAlmostAllUsers(command:LockControlEvent):void {	
      var pres:Array = LiveMeeting.inst().users.getPresenters();
      sender.setAllUsersLock(true, pres);
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

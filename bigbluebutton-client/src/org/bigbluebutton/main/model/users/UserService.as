/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
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
	
	import flash.net.NetConnection;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.managers.UserConfigManager;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.events.SuccessfulLoginEvent;
	import org.bigbluebutton.main.events.UserServicesEvent;
	import org.bigbluebutton.main.model.ConferenceParameters;
	import org.bigbluebutton.main.model.users.events.BroadcastStartedEvent;
	import org.bigbluebutton.main.model.users.events.BroadcastStoppedEvent;
	import org.bigbluebutton.main.model.users.events.ConferenceCreatedEvent;
	import org.bigbluebutton.main.model.users.events.KickUserEvent;
	import org.bigbluebutton.main.model.users.events.LowerHandEvent;
	import org.bigbluebutton.main.model.users.events.RaiseHandEvent;
	import org.bigbluebutton.main.model.users.events.RoleChangeEvent;
	import org.bigbluebutton.main.model.users.events.UsersConnectionEvent;

	public class UserService {
		private var joinService:JoinService;
		private var _userSOService:UsersSOService;
		private var _conferenceParameters:ConferenceParameters;		
		private var applicationURI:String;
		private var hostURI:String;		
		private var connection:NetConnection;
		private var dispatcher:Dispatcher;
		
		public function UserService() {
			dispatcher = new Dispatcher();
		}
		
		public function startService(e:UserServicesEvent):void{
			applicationURI = e.applicationURI;
			hostURI = e.hostURI;
			
			joinService = new JoinService();
			joinService.addJoinResultListener(joinListener);
			joinService.load(e.hostURI);
		}
		
		private function joinListener(success:Boolean, result:Object):void{
			if (success) {
				UserManager.getInstance().getConference().setMyName(result.username);
				UserManager.getInstance().getConference().setMyRole(result.role);
				UserManager.getInstance().getConference().setMyRoom(result.room);
				UserManager.getInstance().getConference().setMyAuthToken(result.authToken);
				
				_conferenceParameters = new ConferenceParameters();
				_conferenceParameters.conference = result.conference;
				_conferenceParameters.username = result.username;
				_conferenceParameters.role = result.role;
				_conferenceParameters.room = result.room;
				_conferenceParameters.webvoiceconf = result.webvoiceconf;
				_conferenceParameters.voicebridge = result.voicebridge;
				_conferenceParameters.welcome = result.welcome;
				_conferenceParameters.meetingID = result.meetingID;
				_conferenceParameters.externUserID = result.externUserID;
				_conferenceParameters.internalUserID = result.internalUserId;
				_conferenceParameters.logoutUrl = result.logoutUrl;
				_conferenceParameters.record = true;
				
				if(result.record == "false") {
					_conferenceParameters.record = false;
				}
				
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
			_userSOService = new UsersSOService(applicationURI);
			_userSOService.connect(_conferenceParameters);	
		}
		
		public function userLoggedIn(e:UsersConnectionEvent):void{
			UserManager.getInstance().getConference().setMyUserid(e.userid);
			_conferenceParameters.connection = e.connection;
			_conferenceParameters.userid = e.userid;
			
			_userSOService.join(e.userid, _conferenceParameters.room);
			
			var loadCommand:SuccessfulLoginEvent = new SuccessfulLoginEvent(SuccessfulLoginEvent.USER_LOGGED_IN);
			loadCommand.conferenceParameters = _conferenceParameters;
			dispatcher.dispatchEvent(loadCommand);		
		}
		
		public function logoutUser():void {
			_userSOService.disconnect(true);
		}
		
		public function disconnectTest():void{
			_userSOService.disconnect(false);
		}
				
		public function isModerator():Boolean {
			return UserManager.getInstance().getConference().amIModerator();
		}
		
		public function get participants():ArrayCollection {
			return UserManager.getInstance().getConference().users;
		}
				
		public function addStream(e:BroadcastStartedEvent):void {
			_userSOService.addStream(e.userid, e.stream);
		}
		
		public function removeStream(e:BroadcastStoppedEvent):void {			
			_userSOService.removeStream(e.userid, e.stream);
		}
		
		public function raiseHand(e:RaiseHandEvent):void {
			_userSOService.raiseHand(UserManager.getInstance().getConference().getMyUserId(), e.raised);
		}
		
		public function lowerHand(e:LowerHandEvent):void {
			if (this.isModerator()) _userSOService.raiseHand(e.userid, false);
		}
		
		public function kickUser(e:KickUserEvent):void{
			if (this.isModerator()) _userSOService.kickUser(e.userid);
		}
		
		/**
		 * Assign a new presenter 
		 * @param e
		 * 
		 */		
		public function assignPresenter(e:RoleChangeEvent):void{
			var assignTo:Number = e.userid;
			var name:String = e.username;
			_userSOService.assignPresenter(assignTo, name, 1);
		}
	}
}
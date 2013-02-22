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
package org.bigbluebutton.main.model.users {
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.net.NetConnection;
	import flash.net.Responder;
	import flash.net.SharedObject;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.events.BBBEvent;
	import org.bigbluebutton.main.events.LogoutEvent;
	import org.bigbluebutton.main.events.MadePresenterEvent;
	import org.bigbluebutton.main.events.ParticipantJoinEvent;
	import org.bigbluebutton.main.events.PresenterStatusEvent;
	import org.bigbluebutton.main.events.NewGuestEvent;
	import org.bigbluebutton.main.events.RemoveGuestRequestEvent;
	import org.bigbluebutton.main.events.ModeratorRespEvent;
	import org.bigbluebutton.main.model.ConferenceParameters;
	import org.bigbluebutton.main.model.User;
	import org.bigbluebutton.main.model.users.events.ConnectionFailedEvent;
	import org.bigbluebutton.main.model.users.events.RoleChangeEvent;

	public class UsersSOService {
		public static const NAME:String = "ViewersSOService";
		public static const LOGNAME:String = "[ViewersSOService]";
		
		private var _participantsSO : SharedObject;
		private static const SO_NAME : String = "participantsSO";
		private static const STATUS:String = "_STATUS";
		
		private var netConnectionDelegate: NetConnectionDelegate;		
		private var _room:String;
		private var _applicationURI:String;
		
		private var dispatcher:Dispatcher;
				
		public function UsersSOService(uri:String) {			
			_applicationURI = uri;
			netConnectionDelegate = new NetConnectionDelegate(uri);
			dispatcher = new Dispatcher();
		}
		
		public function connect(params:ConferenceParameters):void {
			_room = params.room;
			netConnectionDelegate.connect(params);
		}
			
		public function disconnect(onUserAction:Boolean):void {
			if (_participantsSO != null) _participantsSO.close();
			netConnectionDelegate.disconnect(onUserAction);
		}


		public function guestDisconnect():void {
			if (_participantsSO != null) _participantsSO.close();
			netConnectionDelegate.guestDisconnect();
		}
		
		
	    public function join(userid:Number, room:String):void {
			_participantsSO = SharedObject.getRemote(SO_NAME, _applicationURI + "/" + room, false);
			_participantsSO.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
			_participantsSO.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
			_participantsSO.client = this;
			_participantsSO.connect(netConnectionDelegate.connection);
			queryForParticipants();					
			UserManager.getInstance().getConference().setMyUserid(userid);
		}
		
		private function queryForParticipants():void {
			var nc:NetConnection = netConnectionDelegate.connection;
			nc.call(
				"participants.getParticipants",// Remote function name
				new Responder(
	        		// participants - On successful result
					function(result:Object):void { 
						LogUtil.debug("Successfully queried participants: " + result.count); 
						if (result.count > 0) {
							for(var p:Object in result.participants) {
								participantJoined(result.participants[p]);
							}
						}	
						becomePresenterIfLoneModerator();
					},	
					// status - On error occurred
					function(status:Object):void { 
						LogUtil.error("Error occurred:"); 
						for (var x:Object in status) { 
							LogUtil.error(x + " : " + status[x]); 
						} 
						sendConnectionFailedEvent(ConnectionFailedEvent.UNKNOWN_REASON);
					}
				)//new Responder
			); //_netConnection.call
		}
		
		private function becomePresenterIfLoneModerator():void {
			var participants:Conference = UserManager.getInstance().getConference();
			if (participants.hasOnlyOneModerator()) {
				var user:BBBUser = participants.getTheOnlyModerator();
				if (user.me) {
					var presenterEvent:RoleChangeEvent = new RoleChangeEvent(RoleChangeEvent.ASSIGN_PRESENTER);
					presenterEvent.userid = user.userid;
					presenterEvent.username = user.name;
					var dispatcher:Dispatcher = new Dispatcher();
					dispatcher.dispatchEvent(presenterEvent);
				} 
			} 
		}
		
		public function assignPresenter(userid:Number, name:String, assignedBy:Number):void {
			var nc:NetConnection = netConnectionDelegate.connection;
			nc.call("participants.assignPresenter",// Remote function name
				new Responder(
					// On successful result
					function(result:Boolean):void { 
						
						if (result) {
							LogUtil.debug("Successfully assigned presenter to: " + userid);							
						}	
					},	
					// status - On error occurred
					function(status:Object):void { 
						LogUtil.error("Error occurred:"); 
						for (var x:Object in status) { 
							LogUtil.error(x + " : " + status[x]); 
						} 
					}
				), //new Responder
				userid,
				name,
				assignedBy
			); //_netConnection.call
		}
		
		/**
		 * Called by the server to assign a presenter
		 */
		public function assignPresenterCallback(userid:Number, name:String, assignedBy:Number):void {
			LogUtil.debug("assignPresenterCallback " + userid + "," + name + "," + assignedBy);
			var dispatcher:Dispatcher = new Dispatcher();
			var meeting:Conference = UserManager.getInstance().getConference();
			if (meeting.amIThisUser(userid)) {
				meeting.setMePresenter(true);				
				var e:MadePresenterEvent = new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_PRESENTER_MODE);
				e.userid = userid;
				e.presenterName = name;
				e.assignerBy = assignedBy;
				
				dispatcher.dispatchEvent(e);													
			} else {				
				meeting.setMePresenter(false);
				var viewerEvent:MadePresenterEvent = new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_VIEWER_MODE);
				viewerEvent.userid = userid;
				viewerEvent.presenterName = name;
				viewerEvent.assignerBy = assignedBy;

				dispatcher.dispatchEvent(viewerEvent);
			}
		}
		
		public function kickUser(userid:Number):void{
			_participantsSO.send("kickUserCallback", userid);
		}

		public function kickGuest(userid:Number):void {
			_participantsSO.send("kickGuestCallback", userid);
		}

		public function kickUserCallback(userid:Number):void{
			if (UserManager.getInstance().getConference().amIThisUser(userid)){
				dispatcher.dispatchEvent(new LogoutEvent(LogoutEvent.USER_LOGGED_OUT));
			}
		}

		public function kickGuestCallback(userid:Number):void{
			if (UserManager.getInstance().getConference().amIThisUser(userid)){
				dispatcher.dispatchEvent(new LogoutEvent(LogoutEvent.GUEST_KICKED_OUT));
			}
		}
		
		public function participantLeft(user:Object):void { 			
			var participant:BBBUser = UserManager.getInstance().getConference().getParticipant(Number(user));
			
			var dispatcher:Dispatcher = new Dispatcher();

			if(participant.amIGuest()) {
				var e:RemoveGuestRequestEvent = new RemoveGuestRequestEvent(RemoveGuestRequestEvent.GUEST_EVENT);
				e.userid = participant.userid;
				dispatcher.dispatchEvent(e);
			}



			var p:User = new User();
			p.userid = String(participant.userid);
			p.name = participant.name;
			
			UserManager.getInstance().participantLeft(p);
			UserManager.getInstance().getConference().removeParticipant(Number(user));	
			
			
			var joinEvent:ParticipantJoinEvent = new ParticipantJoinEvent(ParticipantJoinEvent.PARTICIPANT_JOINED_EVENT);
			joinEvent.participant = p;
			joinEvent.join = false;
			dispatcher.dispatchEvent(joinEvent);	
			
			

		}
		
		public function participantJoined(joinedUser:Object):void { 
			var user:BBBUser = new BBBUser();
			user.userid = Number(joinedUser.userid);
			user.name = joinedUser.name;
			user.role = joinedUser.role;
			user.guest = joinedUser.guest;
			user.acceptedJoin = !user.guest;

			LogUtil.debug("User status: " + joinedUser.status.hasStream);

			LogUtil.info("Joined as [" + user.userid + "," + user.name + "," + user.role + "," + user.guest + "]");
			UserManager.getInstance().getConference().addUser(user);
			participantStatusChange(user.userid, "hasStream", joinedUser.status.hasStream);
			participantStatusChange(user.userid, "presenter", joinedUser.status.presenter);
			participantStatusChange(user.userid, "raiseHand", joinedUser.status.raiseHand);

			var participant:User = new User();
			participant.userid = String(user.userid);
			participant.name = user.name;
			participant.isPresenter = joinedUser.status.presenter;
			participant.role = user.role;
			participant.guest = user.guest;
			UserManager.getInstance().participantJoined(participant);
			
			var dispatcher:Dispatcher = new Dispatcher();
			var joinEvent:ParticipantJoinEvent = new ParticipantJoinEvent(ParticipantJoinEvent.PARTICIPANT_JOINED_EVENT);
			joinEvent.participant = participant;
			joinEvent.join = true;
			dispatcher.dispatchEvent(joinEvent);	
			
		}
		
		/**
		 * Called by the server to tell the client that the meeting has ended.
		 */
		public function logout():void {
			var dispatcher:Dispatcher = new Dispatcher();
			var endMeetingEvent:BBBEvent = new BBBEvent(BBBEvent.END_MEETING_EVENT);
			dispatcher.dispatchEvent(endMeetingEvent);
		}
		
		
		/**
		 * Callback from the server from many of the bellow nc.call methods
		 */
		public function participantStatusChange(userid:Number, status:String, value:Object):void {
			LogUtil.debug("Received status change [" + userid + "," + status + "," + value + "]")			
			UserManager.getInstance().getConference().newUserStatus(userid, status, value);
			
			if (status == "presenter"){
				var e:PresenterStatusEvent = new PresenterStatusEvent(PresenterStatusEvent.PRESENTER_NAME_CHANGE);
				e.userid = userid;
				var dispatcher:Dispatcher = new Dispatcher();
				dispatcher.dispatchEvent(e);
			}		
		}
		//Callback from server	
		public function guestEntrance(userid:Number, name:String):void {
			if(UserManager.getInstance().getConference().amIModerator() && UserManager.getInstance().getConference().amIWaitForModerator() == false) {
				var e:NewGuestEvent = new NewGuestEvent(NewGuestEvent.NEW_GUEST_EVENT);
				e.userid = userid;
				e.name = name;				
				var dispatcher:Dispatcher = new Dispatcher();
				dispatcher.dispatchEvent(e);
			}
		}
		
		public function guestResponse(userid:Number, resp:Boolean):void {
			if(UserManager.getInstance().getConference().getMyUserId() == userid) {
				if(UserManager.getInstance().getConference().amIWaitForModerator()) {
					UserManager.getInstance().getConference().setWaitForModerator(false);
					if(resp == false)
						kickGuest(userid);
					else {
						var allowCommand:ModeratorRespEvent = new ModeratorRespEvent(ModeratorRespEvent.GUEST_ALLOWED);
						var dispatcherCommand:Dispatcher = new Dispatcher();
						dispatcherCommand.dispatchEvent(allowCommand);
					}
				}
			}

			if(UserManager.getInstance().getConference().amIModerator()) {
				var e:RemoveGuestRequestEvent = new RemoveGuestRequestEvent(RemoveGuestRequestEvent.GUEST_EVENT);
				e.userid = userid;
				var dispatcher:Dispatcher = new Dispatcher();
				dispatcher.dispatchEvent(e);				
			}
		}

		public function raiseHand(userid:Number, raise:Boolean):void {
			var nc:NetConnection = netConnectionDelegate.connection;			
			nc.call(
				"participants.setParticipantStatus",// Remote function name
				responder,
				userid,
				"raiseHand",
				raise
			); //_netConnection.call
		}


		public function responseToAllGuests(resp:Boolean):void {
			var nc:NetConnection = netConnectionDelegate.connection;			
			nc.call(
				"participants.responseToAllGuests",// Remote function name
				responder,
				resp
			); //_netConnection.call
		}


		public function askForGuestWaiting(userid:Number):void {
			var nc:NetConnection = netConnectionDelegate.connection;			
			nc.call(
				"participants.askingForGuestWaiting",// Remote function name
				responder,
				userid
			); //_netConnection.call
		}


		public function newGuestPolicy(guestPolicy:String):void {
			
		 	var nc:NetConnection = netConnectionDelegate.connection;			
			nc.call(
				"participants.newGuestPolicy",
				responder,
				guestPolicy
			); //_netConnection.call
			
			
		}

		public function guestPolicyChanged(guestPolicy:String):void {
		    var policy:BBBEvent = new BBBEvent("GET_GUEST_POLICY");
		    policy.payload['guestPolicy'] = guestPolicy;
		    dispatcher.dispatchEvent(policy);
		    
		    LogUtil.debug("Received from server: " + guestPolicy);
			
		}


		public function getGuestPolicy():void {
			var nc:NetConnection = netConnectionDelegate.connection;			
			nc.call(
				"participants.getGuestPolicy",// Remote function name
				new Responder(
	        			function(result:Object):void { 
							var policy:BBBEvent = new BBBEvent("GET_GUEST_POLICY");
							policy.payload['guestPolicy'] = result;
							if(UserManager.getInstance().getConference().isGuest()) {
								if(result == "ALWAYS_DENY")
									dispatcher.dispatchEvent(new BBBEvent("DENY_GUEST"));
								else if(result == "ALWAYS_ACCEPT")
									dispatcher.dispatchEvent(new BBBEvent("ACCEPT_GUEST"));
								else
								     dispatcher.dispatchEvent(new BBBEvent("ASK_TO_ACCEPT_GUEST"));
							}
							dispatcher.dispatchEvent(policy);
					},	
					// status - On error occurred
					function(status:Object):void { 
						LogUtil.error("Error occurred:"); 
						for (var x:Object in status) { 
							LogUtil.error(x + " : " + status[x]); 
						} 
					}
				)//new Responder
			); //_netConnection.call
		}

		public function guestWaitingForModerator(userid:Number, userId_userName:String):void {
			if(UserManager.getInstance().getConference().getMyUserId() == userid && UserManager.getInstance().getConference().amIModerator()) {
				if(userId_userName != "") {
					var i:int = 0;
					var users:Array =  userId_userName.split("!1");
					for(i = 0; i < users.length; i++) {
						if(users[i] != "") {
							var pairSplited:Array = users[i].split("!2");
							var newGuestEvent:NewGuestEvent = new NewGuestEvent(NewGuestEvent.NEW_GUEST_EVENT);
							newGuestEvent.userid = new Number(pairSplited[0]);
							newGuestEvent.name = pairSplited[1];
							var dispatcher:Dispatcher = new Dispatcher();
							dispatcher.dispatchEvent(newGuestEvent);
						}
					}
				}	
			}		
		}

		public function askToEnter(userid:Number):void {
			var nc:NetConnection = netConnectionDelegate.connection;			
			nc.call(
				"participants.askingToEnter",// Remote function name
				responder,
				userid
			); //_netConnection.call
		}

		public function responseToGuest(userid:Number, resp:Boolean):void {
			var nc:NetConnection = netConnectionDelegate.connection;			
			nc.call(
				"participants.responseToGuest",// Remote function name
				 responder,
				 userid,
				 resp
			); //_netConnection.call
		}
		
		public function addStream(userid:Number, streamName:String):void {
			var nc:NetConnection = netConnectionDelegate.connection;	
			nc.call(
				"participants.setParticipantStatus",// Remote function name
				responder,
				userid,
				"hasStream",
				"true,stream=" + streamName
			); //_netConnection.call
		}
		
		public function removeStream(userid:Number, streamName:String):void {
			var nc:NetConnection = netConnectionDelegate.connection;			
			nc.call(
				"participants.setParticipantStatus",// Remote function name
				responder,
				userid,
				"hasStream",
				"false,stream=" + streamName
			); //_netConnection.call
		}

		private function netStatusHandler ( event : NetStatusEvent ):void {
			var statusCode : String = event.info.code;
			
			switch (statusCode)  {
				case "NetConnection.Connect.Success" :
					LogUtil.debug(LOGNAME + ":Connection Success");		
					sendConnectionSuccessEvent();			
					break;
			
				case "NetConnection.Connect.Failed" :			
					LogUtil.debug(LOGNAME + ":Connection to viewers application failed");
					sendConnectionFailedEvent(ConnectionFailedEvent.CONNECTION_FAILED);
					break;
					
				case "NetConnection.Connect.Closed" :									
					LogUtil.debug(LOGNAME + ":Connection to viewers application closed");
					sendConnectionFailedEvent(ConnectionFailedEvent.CONNECTION_CLOSED);
					break;
					
				case "NetConnection.Connect.InvalidApp" :				
					LogUtil.debug(LOGNAME + ":Viewers application not found on server");
					sendConnectionFailedEvent(ConnectionFailedEvent.INVALID_APP);
					break;
					
				case "NetConnection.Connect.AppShutDown" :
					LogUtil.debug(LOGNAME + ":Viewers application has been shutdown");
					sendConnectionFailedEvent(ConnectionFailedEvent.APP_SHUTDOWN);
					break;
					
				case "NetConnection.Connect.Rejected" :
					LogUtil.debug(LOGNAME + ":No permissions to connect to the viewers application" );
					sendConnectionFailedEvent(ConnectionFailedEvent.CONNECTION_REJECTED);
					break;
					
				default :
				   LogUtil.debug(LOGNAME + ":default - " + event.info.code );
				   sendConnectionFailedEvent(ConnectionFailedEvent.UNKNOWN_REASON);
				   break;
			}
		}
			
		private function asyncErrorHandler ( event : AsyncErrorEvent ) : void
		{
			LogUtil.debug(LOGNAME + "participantsSO asyncErrorHandler " + event.error);
			sendConnectionFailedEvent(ConnectionFailedEvent.ASYNC_ERROR);
		}
		
		public function get connection():NetConnection
		{
			return netConnectionDelegate.connection;
		}
		
		private function sendConnectionFailedEvent(reason:String):void{
			/*var e:ConnectionFailedEvent = new ConnectionFailedEvent(ConnectionFailedEvent.CONNECTION_LOST);
			e.reason = reason;
			dispatcher.dispatchEvent(e);*/
		}
		
		private function sendConnectionSuccessEvent():void{
			//TODO
		}
		
		private var responder:Responder = new Responder(
			// On successful result
			function(result:Boolean):void { 	
			},	
			// On error occurred
			function(status:Object):void { 
				LogUtil.error("Error occurred:"); 
				for (var x:Object in status) { 
					LogUtil.error(x + " : " + status[x]); 
				} 
			}
		)
	}
}

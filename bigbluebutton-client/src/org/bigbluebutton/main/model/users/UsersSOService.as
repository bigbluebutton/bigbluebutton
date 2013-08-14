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
package org.bigbluebutton.main.model.users {
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.net.NetConnection;
	import flash.net.Responder;
	import flash.net.SharedObject;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.common.Role;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.EventConstants;
	import org.bigbluebutton.core.events.CoreEvent;
	import org.bigbluebutton.core.managers.ConnectionManager;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.events.BBBEvent;
	import org.bigbluebutton.main.events.LogoutEvent;
	import org.bigbluebutton.main.events.MadePresenterEvent;
	import org.bigbluebutton.main.events.PresenterStatusEvent;
	import org.bigbluebutton.main.events.SwitchedPresenterEvent;
	import org.bigbluebutton.main.events.UserJoinedEvent;
	import org.bigbluebutton.main.events.UserLeftEvent;
	import org.bigbluebutton.main.model.ConferenceParameters;
	import org.bigbluebutton.main.model.users.events.ConnectionFailedEvent;
	import org.bigbluebutton.main.model.users.events.RoleChangeEvent;
	import org.bigbluebutton.util.i18n.ResourceUtil;
	import flash.external.ExternalInterface;
	import org.bigbluebutton.main.model.users.BBBUser;

	public class UsersSOService {
		public static const NAME:String = "ViewersSOService";
		public static const LOGNAME:String = "[ViewersSOService]";
		
		private var _participantsSO : SharedObject;
		private static const SO_NAME : String = "participantsSO";
		private static const STATUS:String = "_STATUS";
		
    private var _connectionManager:ConnectionManager;
        
		private var _room:String;
		private var _applicationURI:String;
		
		private var dispatcher:Dispatcher;
				
		public function UsersSOService(uri:String) {			
			_applicationURI = uri;
      _connectionManager = BBB.initConnectionManager();
      _connectionManager.setUri(uri);
			dispatcher = new Dispatcher();
		}
		
		public function connect(params:ConferenceParameters):void {
			_room = params.room;
      _connectionManager.connect(params);
		}
			
		public function disconnect(onUserAction:Boolean):void {
			if (_participantsSO != null) {
        _participantsSO.close();
      }
      _connectionManager.disconnect(onUserAction);
		}
		
	    public function join(userid:String, room:String):void {
			_participantsSO = SharedObject.getRemote(SO_NAME, _applicationURI + "/" + room, false);
			_participantsSO.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
			_participantsSO.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
			_participantsSO.client = this;
			_participantsSO.connect(_connectionManager.connection);
      LogUtil.debug("In UserSOService:join - Setting my userid to [" + userid + "]");
      UserManager.getInstance().getConference().setMyUserid(userid);
			queryForParticipants();					
			
		}
		
		private function queryForParticipants():void {
			var nc:NetConnection = _connectionManager.connection;
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
      LogUtil.debug("Checking if I need to become presenter.");
			var participants:Conference = UserManager.getInstance().getConference();
			if (participants.hasOnlyOneModerator()) {
        LogUtil.debug("There is only one moderator in the meeting. Is it me? ");
				var user:BBBUser = participants.getTheOnlyModerator();
				if (user.me) {
          LogUtil.debug("Setting me as presenter because I'm the only moderator. My userid is [" + user.userID + "]");
					var presenterEvent:RoleChangeEvent = new RoleChangeEvent(RoleChangeEvent.ASSIGN_PRESENTER);
					presenterEvent.userid = user.userID;
					presenterEvent.username = user.name;
					var dispatcher:Dispatcher = new Dispatcher();
					dispatcher.dispatchEvent(presenterEvent);
				} else {
          LogUtil.debug("No. It is not me. It is [" + user.userID + ", " + user.name + "]");
        }
			} else {
        LogUtil.debug("No. There are more than one moderator.");
      }
		}
		
		public function assignPresenter(userid:String, name:String, assignedBy:Number):void {
			var nc:NetConnection = _connectionManager.connection;
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
		public function assignPresenterCallback(userid:String, name:String, assignedBy:String):void {
			trace("**** assignPresenterCallback [" + userid + "," + name + "," + assignedBy + "]");
      
			var meeting:Conference = UserManager.getInstance().getConference();

			if (meeting.amIPresenter){
				// Give the former presenter an audio alert IF he or she is using a screen reader
				ExternalInterface.call("addAlert", ResourceUtil.getInstance().getString("bbb.accessibility.alerts.madeViewer"));
			}
			
			if (meeting.amIThisUser(userid)) {
        trace("**** Switching [" + name + "] to presenter");
        sendSwitchedPresenterEvent(true, userid);
        
				meeting.amIPresenter = true;				
				var e:MadePresenterEvent = new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_PRESENTER_MODE);
				e.userID = userid;
				e.presenterName = name;
				e.assignerBy = assignedBy;
				
				dispatcher.dispatchEvent(e);
				
				// Give the new presenter an audio alert IF he or she is using a screen reader
				ExternalInterface.call("addAlert", ResourceUtil.getInstance().getString("bbb.accessibility.alerts.madePresenter"));
				
			} else {	
        trace("**** Switching [" + name + "] to presenter. I am viewer.");
        sendSwitchedPresenterEvent(false, userid);
        
				meeting.amIPresenter = false;
				var viewerEvent:MadePresenterEvent = new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_VIEWER_MODE);
				viewerEvent.userID = userid;
				viewerEvent.presenterName = name;
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
    
		public function kickUser(userid:String):void{
			_participantsSO.send("kickUserCallback", userid);
		}
		
		public function kickUserCallback(userid:String):void {
      var kickedEvent:LogoutEvent = new LogoutEvent(LogoutEvent.USER_KICKED_OUT);
      kickedEvent.userID = userid;
      dispatcher.dispatchEvent(kickedEvent);
      
			if (UserManager.getInstance().getConference().amIThisUser(userid)) {
				dispatcher.dispatchEvent(new LogoutEvent(LogoutEvent.USER_LOGGED_OUT));
			}
		}
		
		public function participantLeft(userID:String):void { 			
			var user:BBBUser = UserManager.getInstance().getConference().getUser(userID);
			
      trace("Notify others that user [" + user.userID + ", " + user.name + "] is leaving!!!!");
      
      // Flag that the user is leaving the meeting so that apps (such as avatar) doesn't hang
      // around when the user already left.
      user.isLeavingFlag = true;
      
			var joinEvent:UserLeftEvent = new UserLeftEvent(UserLeftEvent.LEFT);
			joinEvent.userID = user.userID;
			dispatcher.dispatchEvent(joinEvent);	
      
      UserManager.getInstance().getConference().removeUser(userID);	      
		}
		
		public function participantJoined(joinedUser:Object):void { 
			var user:BBBUser = new BBBUser();
			user.userID = joinedUser.userid;
			user.name = joinedUser.name;
			user.role = joinedUser.role;
      user.externUserID = joinedUser.externUserID;
      user.isLeavingFlag = false;
      
			LogUtil.debug("User status: " + joinedUser.status.hasStream);

			LogUtil.info("Joined as [" + user.userID + "," + user.name + "," + user.role + "]");
			UserManager.getInstance().getConference().addUser(user);
			participantStatusChange(user.userID, "hasStream", joinedUser.status.hasStream);
			participantStatusChange(user.userID, "presenter", joinedUser.status.presenter);
			participantStatusChange(user.userID, "raiseHand", joinedUser.status.raiseHand);
			

			var joinEvent:UserJoinedEvent = new UserJoinedEvent(UserJoinedEvent.JOINED);
			joinEvent.userID = user.userID;
			dispatcher.dispatchEvent(joinEvent);	
			
		}
		
		/**
		 * Called by the server to tell the client that the meeting has ended.
		 */
		public function logout():void {

			var endMeetingEvent:BBBEvent = new BBBEvent(BBBEvent.END_MEETING_EVENT);
			dispatcher.dispatchEvent(endMeetingEvent);
		}
		
		
		/**
		 * Callback from the server from many of the bellow nc.call methods
		 */
		public function participantStatusChange(userID:String, status:String, value:Object):void {
			LogUtil.debug("Received status change [" + userID + "," + status + "," + value + "]")			
			UserManager.getInstance().getConference().newUserStatus(userID, status, value);
			
			if (status == "presenter"){
				var e:PresenterStatusEvent = new PresenterStatusEvent(PresenterStatusEvent.PRESENTER_NAME_CHANGE);
				e.userID = userID;

				dispatcher.dispatchEvent(e);
			}		
		}
					
		public function raiseHand(userID:String, raise:Boolean):void {
			var nc:NetConnection = _connectionManager.connection;			
			nc.call(
				"participants.setParticipantStatus",// Remote function name
				responder,
        userID,
				"raiseHand",
				raise
			); //_netConnection.call
		}
		
		public function addStream(userID:String, streamName:String):void {
			var nc:NetConnection = _connectionManager.connection;	
			nc.call(
				"participants.setParticipantStatus",// Remote function name
				responder,
        userID,
				"hasStream",
				"true,stream=" + streamName
			); //_netConnection.call
		}
		
		public function removeStream(userID:String, streamName:String):void {
			var nc:NetConnection = _connectionManager.connection;			
			nc.call(
				"participants.setParticipantStatus",// Remote function name
				responder,
        userID,
				"hasStream",
				"false,stream=" + streamName
			); //_netConnection.call
		}

		private function netStatusHandler(event:NetStatusEvent):void {
			var statusCode:String = event.info.code;
			
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
			
		private function asyncErrorHandler(event:AsyncErrorEvent):void {
			LogUtil.debug(LOGNAME + "participantsSO asyncErrorHandler " + event.error);
			sendConnectionFailedEvent(ConnectionFailedEvent.ASYNC_ERROR);
		}
		
		public function get connection():NetConnection {
			return _connectionManager.connection;
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
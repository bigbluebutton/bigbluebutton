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
package org.bigbluebutton.core.services 
{
	import flash.events.AsyncErrorEvent;
	import flash.events.IEventDispatcher;
	import flash.events.NetStatusEvent;
	import flash.events.SyncEvent;
	import flash.net.NetConnection;
	import flash.net.Responder;
	import flash.net.SharedObject;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.controllers.events.ConnectionFailedEvent;
	import org.bigbluebutton.core.controllers.events.ListeningForUserMessagesEvent;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.core.model.MeetingModel;
	import org.bigbluebutton.core.vo.Status;
	import org.bigbluebutton.core.vo.User;
	import org.bigbluebutton.main.events.BBBEvent;
	import org.bigbluebutton.main.events.LogoutEvent;
	import org.bigbluebutton.main.events.MadePresenterEvent;
	import org.bigbluebutton.main.events.ParticipantJoinEvent;
	import org.bigbluebutton.main.events.PresenterStatusEvent;
	import org.bigbluebutton.main.model.ConferenceParameters;
	import org.bigbluebutton.main.model.users.events.RoleChangeEvent;

	public class UsersService {

        public var red5Conn:Red5BBBAppConnectionService;
        public var meetingModel:MeetingModel;
        private var _dispatcher:IEventDispatcher;
        
		private var _participantsSO:SharedObject;
		private static const SO_NAME : String = "participantsSO";
		private static const STATUS:String = "_STATUS";		
		private var _room:String;
		private var _applicationURI:String;
		
        public function UsersService(dispatcher:IEventDispatcher) {
            _dispatcher = dispatcher;    
        }
        
		public function disconnect(onUserAction:Boolean):void {
			if (_participantsSO != null) _participantsSO.close();
		}
		
        public function presentationConverted():void {
            LogUtil.debug("***** BOOOOOOOO YAAAAHHHHHH ****");
        }
        
	    public function listenForUserMessages():void {
            LogUtil.debug("invoking listen for user messages");
            _participantsSO = SharedObject.getRemote(SO_NAME, red5Conn.connectionUri, false);
			_participantsSO.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
            _participantsSO.addEventListener(SyncEvent.SYNC, syncEventHandler);
			_participantsSO.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
			_participantsSO.client = this;
			_participantsSO.connect(red5Conn.connection);
		}
		
		public function getAllUsers():void {
            LogUtil.debug("Getting all users.");
			var nc:NetConnection = red5Conn.connection;
			nc.call("participants.getParticipants",// Remote function name
				new Responder(
	        		// participants - On successful result
					function(result:Object):void { 
						if (result.count > 0) {
							var u:ArrayCollection = new ArrayCollection();
							for(var p:Object in result.participants) {
								u.addItem(parseUser(result.participants[p]));
							}
                            meetingModel.addAllUsers(u);
						}	
					},	
					// status - On error occurred
					function(status:Object):void { 
                        LogUtil.error("Error occurred: queryForParticipants"); 
					}
				)//new Responder
			); //_netConnection.call
		}
		
        private function parseUser(joinedUser:Object):User { 
            var user:User = new User();
            user.userid = joinedUser.userid.toString();
            user.name = joinedUser.name;
            user.role = joinedUser.role;
            user.addStatus(new Status("hasStream", joinedUser.status.hasStream));           
            user.addStatus(new Status("presenter", joinedUser.status.presenter));
            user.addStatus(new Status("raiseHand", joinedUser.status.raiseHand));
            LogUtil.debug("User joined " + user.toString());
            return user;       
        }
        
		public function assignPresenter(userid:Number, name:String, assignedBy:Number):void {
			var nc:NetConnection = red5Conn.connection;
			nc.call("participants.assignPresenter",// Remote function name
				new Responder(
					// On successful result
					function(result:Boolean):void { 						
						if (result) {
                            LogUtil.debug("Successfully assigned presenter to: " + userid);
                            meetingModel.assignNewPresenter(userid.toString(), assignedBy.toString());
						}	
					},	
					// status - On error occurred
					function(status:Object):void { 
                        LogUtil.error("Error occurred:"); 
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
            meetingModel.assignNewPresenter(userid.toString(), assignedBy.toString());
		}
		
		public function kickUser(userid:Number):void {
//            _participantsSO.send("kickUserCallback", userid);
		}
		
		public function kickUserCallback(userid:Number):void {
//			if (UserManager.getInstance().getConference().amIThisUser(userid)){
//				dispatcher.dispatchEvent(new LogoutEvent(LogoutEvent.USER_LOGGED_OUT));
//			}
		}
		
		public function participantLeft(user:Object):void { 			
/*			var participant:org.bigbluebutton.core.model.vo.User = UserManager.getInstance().getConference().getParticipant(Number(user));
			
			var p:User = new User();
			p.userid = String(participant.userid);
			p.name = participant.name;
			
			UserManager.getInstance().participantLeft(p);
			UserManager.getInstance().getConference().removeParticipant(Number(user));	
			
			var dispatcher:Dispatcher = new Dispatcher();
			var joinEvent:ParticipantJoinEvent = new ParticipantJoinEvent(ParticipantJoinEvent.PARTICIPANT_JOINED_EVENT);
			joinEvent.participant = p;
			joinEvent.join = false;
			dispatcher.dispatchEvent(joinEvent);
*/		}
		
		public function participantJoined(joinedUser:Object):void { 
/*			var user:org.bigbluebutton.core.model.vo.User = new org.bigbluebutton.core.model.vo.User();
			user.userid = Number(joinedUser.userid);
			user.name = joinedUser.name;
			user.role = joinedUser.role;

			LogUtil.debug("User status: " + joinedUser.status.hasStream);

			LogUtil.info("Joined as [" + user.userid + "," + user.name + "," + user.role + "]");
			UserManager.getInstance().getConference().addUser(user);
			participantStatusChange(user.userid, "hasStream", joinedUser.status.hasStream);
			participantStatusChange(user.userid, "presenter", joinedUser.status.presenter);
			participantStatusChange(user.userid, "raiseHand", joinedUser.status.raiseHand);

			var participant:User = new User();
			participant.userid = String(user.userid);
			participant.name = user.name;
			participant.isPresenter = joinedUser.status.presenter;
			participant.role = user.role;
			UserManager.getInstance().participantJoined(participant);
			
			var dispatcher:Dispatcher = new Dispatcher();
			var joinEvent:ParticipantJoinEvent = new ParticipantJoinEvent(ParticipantJoinEvent.PARTICIPANT_JOINED_EVENT);
			joinEvent.participant = participant;
			joinEvent.join = true;
			dispatcher.dispatchEvent(joinEvent);	
*/			
		}
		
		/**
		 * Called by the server to tell the client that the meeting has ended.
		 */
		public function logout():void {
//			var dispatcher:Dispatcher = new Dispatcher();
//			var endMeetingEvent:BBBEvent = new BBBEvent(BBBEvent.END_MEETING_EVENT);
//			dispatcher.dispatchEvent(endMeetingEvent);
		}
		
		
		/**
		 * Callback from the server from many of the bellow nc.call methods
		 */
		public function participantStatusChange(userid:Number, status:String, value:Object):void {
/*			LogUtil.debug("Received status change [" + userid + "," + status + "," + value + "]")			
			UserManager.getInstance().getConference().newUserStatus(userid, status, value);
			
			if (status == "presenter"){
				var e:PresenterStatusEvent = new PresenterStatusEvent(PresenterStatusEvent.PRESENTER_NAME_CHANGE);
				e.userid = userid;
				var dispatcher:Dispatcher = new Dispatcher();
				dispatcher.dispatchEvent(e);
			}		
*/		}
					
		public function raiseHand(userid:Number, raise:Boolean):void {
/*			var nc:NetConnection = netConnectionDelegate.connection;			
			nc.call(
				"participants.setParticipantStatus",// Remote function name
				responder,
				userid,
				"raiseHand",
				raise
			); //_netConnection.call
*/		}
		
		public function addStream(userid:Number, streamName:String):void {
/*			var nc:NetConnection = red5Conn.connection;	
			nc.call(
				"participants.setParticipantStatus",// Remote function name
				responder,
				userid,
				"hasStream",
				"true,stream=" + streamName
			); //_netConnection.call
*/		}
		
		public function removeStream(userid:Number, streamName:String):void {
/*			var nc:NetConnection = red5Conn.connection;			
			nc.call(
				"participants.setParticipantStatus",// Remote function name
				responder,
				userid,
				"hasStream",
				"false,stream=" + streamName
			); //_netConnection.call
*/		}

        private function syncEventHandler(event:SyncEvent):void {
            var statusCode:String = event.type;
            LogUtil.debug("SYNC_EVENT: " + statusCode);
            LogUtil.debug(event.changeList.length.toString());
            if (event.changeList.length > 0) {
                for (var i:int = 0; i < event.changeList.length; i++ ) {
                    LogUtil.debug("Event change: " + event.changeList[i].code);
                }                
            }
            _dispatcher.dispatchEvent(new ListeningForUserMessagesEvent());
        }
        
		private function netStatusHandler(event:NetStatusEvent):void {
			var statusCode:String = event.info.code;
            LogUtil.debug("*** SO " + statusCode);
            
			switch (statusCode)  {
				case "NetConnection.Connect.Success" :
                    LogUtil.debug("Listening for user messages ");		
                    _dispatcher.dispatchEvent(new ListeningForUserMessagesEvent());			
					break;
			
				case "NetConnection.Connect.Failed" :			
                    LogUtil.debug(":Connection to viewers application failed");
					sendConnectionFailedEvent(ConnectionFailedEvent.CONNECTION_FAILED);
					break;
					
				case "NetConnection.Connect.Closed" :									
                    LogUtil.debug(":Connection to viewers application closed");
					sendConnectionFailedEvent(ConnectionFailedEvent.CONNECTION_CLOSED);
					break;
					
				case "NetConnection.Connect.InvalidApp" :				
                    LogUtil.debug(":Viewers application not found on server");
					sendConnectionFailedEvent(ConnectionFailedEvent.INVALID_APP);
					break;
					
				case "NetConnection.Connect.AppShutDown" :
                    LogUtil.debug(":Viewers application has been shutdown");
					sendConnectionFailedEvent(ConnectionFailedEvent.APP_SHUTDOWN);
					break;
					
				case "NetConnection.Connect.Rejected" :
                    LogUtil.debug(":No permissions to connect to the viewers application" );
					sendConnectionFailedEvent(ConnectionFailedEvent.CONNECTION_REJECTED);
					break;
					
				default :
                    LogUtil.debug(":default - " + event.info.code );
				   sendConnectionFailedEvent(ConnectionFailedEvent.UNKNOWN_REASON);
				   break;
			}
		}
			
		private function asyncErrorHandler(event:AsyncErrorEvent):void
		{
            LogUtil.debug("participantsSO asyncErrorHandler " + event.error);
			sendConnectionFailedEvent(ConnectionFailedEvent.ASYNC_ERROR);
		}
		
		private function sendConnectionFailedEvent(reason:String):void {
			/*var e:ConnectionFailedEvent = new ConnectionFailedEvent(ConnectionFailedEvent.CONNECTION_LOST);
			e.reason = reason;
			dispatcher.dispatchEvent(e);*/
		}
		
		private function sendConnectionSuccessEvent():void {
			//TODO
		}
		
	}
}
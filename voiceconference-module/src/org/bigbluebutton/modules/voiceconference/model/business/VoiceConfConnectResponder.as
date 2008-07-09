/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.modules.voiceconference.model.business
{
	import flash.events.AsyncErrorEvent;
	import flash.events.Event;
	import flash.events.NetStatusEvent;
	import flash.events.SyncEvent;
	import flash.net.Responder;
	import flash.net.SharedObject;
	
	import mx.collections.ArrayCollection;
	import mx.rpc.IResponder;
	
	import org.bigbluebutton.modules.voiceconference.VoiceConferenceFacade;
	import org.bigbluebutton.modules.voiceconference.control.notifiers.MuteNotifier;
	import org.bigbluebutton.modules.voiceconference.model.VoiceConferenceRoom;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.bigbluebutton.modules.log.LogModuleFacade;

			
	/**
	 *  This class receives notifications of server events
	 * <p>
	 * This class extends the Mediator class of the PureMVC framework
	 * <p>
	 * This class implements the IResponder Interface
	 * @author dev_team@bigbluebutton.org
	 * 
	 */			
	public class VoiceConfConnectResponder extends Mediator implements IResponder, IMediator
	{
		public static const NAME:String = "MeetMeConnectResponder";
		public static const CLOSE:String = "Close Connection";
		public static const RESULT:String = "Got result";
		public static const FAULT:String = "Got fault";
		
		private var model:VoiceConferenceFacade = VoiceConferenceFacade.getInstance();
		
		private var meetMeRoom : VoiceConferenceRoom;
		private var participantsSO : SharedObject;
		private var participants : Array;
		
		//private var log:TempLogBridge;
		private var log : LogModuleFacade = LogModuleFacade.getInstance("LogModule");		
		/**
		 * The default constructor. 
		 * @param meetMeRoom - The MeetMeRoom class of the MeetMe module
		 * 
		 */				
		public function VoiceConfConnectResponder(meetMeRoom:VoiceConferenceRoom)
		{
			super(NAME);
			this.meetMeRoom = meetMeRoom;
			//log = new TempLogBridge();
		}
		
		/**
		 * 
		 * @return The list of notifications this class is interested in
		 * 	VoiceConfConnectResponder.CLOSE
		 * 	VoiceConfConnectResponder.RESULT
		 * 	VoiceConfConnectResponder.FAULT
		 * 	VoiceConferenceFacade.MUTE_UNMUTE_USER_COMMAND
		 * 	VoiceConferenceFacade.MUTE_ALL_USERS_COMMAND
		 * 	VoiceConferenceFacade.EJECT_USER_COMMAND
		 * 
		 */		
		override public function listNotificationInterests():Array{
			return [
					CLOSE,
					RESULT,
					FAULT,
					VoiceConferenceFacade.MUTE_UNMUTE_USER_COMMAND,
					VoiceConferenceFacade.MUTE_ALL_USERS_COMMAND,
					VoiceConferenceFacade.EJECT_USER_COMMAND,
					VoiceConferenceFacade.MUTE_EVENT
					];
		}
		
		/**
		 * Handles notifications received 
		 * @param notification
		 * 
		 */		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case CLOSE:
					close();
					break;
				case RESULT:
					result(notification.getBody() as Event);
					break;
				case FAULT:
					fault(notification.getBody() as Event);
					break;
				case VoiceConferenceFacade.MUTE_ALL_USERS_COMMAND:
					muteAllUsers(notification.getBody() as Boolean);
					break;
				case VoiceConferenceFacade.MUTE_EVENT:
					muteUnmuteUser(notification.getBody() as MuteNotifier);
					break;
				case VoiceConferenceFacade.EJECT_USER_COMMAND:
					ejectUser(notification.getBody() as Number);
					break;
			}
		}
		
		/**
		 *  
		 * @return - The NetConnectionDelegate Proxy of the VoiceConference Module 
		 * 
		 */		
		public function get proxy():NetConnectionDelegate{
			return facade.retrieveProxy(NetConnectionDelegate.NAME) as NetConnectionDelegate;
		}
		
		/**
		 * 
		 * The result method is called when the delegate receives 
		 * a result from the service
		 * 
		 * @param event
		 */		
		public function result(  event : Object  ) : void {
			var info : Object = event.info;
			var statusCode : String = info.code;

			meetMeRoom.isConnected = false;

			switch ( statusCode ) 
			{
				case "NetConnection.Connect.Success" :
					//
					meetMeRoom.isConnected = true;
									
					// find out if it's a secure (HTTPS/TLS) connection
					if ( event.target.connectedProxyType == "HTTPS" || event.target.usingTLS ) {
						log.voice("MeetMe:: Connected to secure server");
					} else {
						log.voice("MeetMe: Connected to server");
					}
					
					joinMeetMeRoom();
					
					var nc_responder : Responder;
					nc_responder = new Responder(getMeetMeUsers, null);
					
					// call the server side method to get list of FLV's
					proxy.getConnection().call("meetmeService.getMeetMeUsers", nc_responder);
				    //meetMeRoom.getConnection().getConnection().call("meetmeService.getMeetMeUsers", nc_responder);
					
					break;
			
				case "NetConnection.Connect.Failed" :
					
//					serverDisconnect(DisconnectedEvent.FAILED, "Connection to server failed");
					
					log.voice("MeetMe::Connection to server failed");
					break;
					
				case "NetConnection.Connect.Closed" :
					
//					serverDisconnect(DisconnectedEvent.CLOSED, "Connection to server closed");
					
					log.voice("MeetMe::Connection to server closed");
					break;
					
				case "NetConnection.Connect.InvalidApp" :
//					serverDisconnect(DisconnectedEvent.INVALID_APP, "Application not found on server")
					log.voice("MeetMe::Application not found on server");
					break;
					
				case "NetConnection.Connect.AppShutDown" :
//					serverDisconnect(DisconnectedEvent.APP_SHUTDOWN, "Application has been shutdown");
					log.voice("MeetMe::Application has been shutdown");
					break;
					
				case "NetConnection.Connect.Rejected" :
//					serverDisconnect(DisconnectedEvent.REJECTED, "No permissions to connect to the application");
					log.voice("MeetMe::No permissions to connect to the application" );
					break;
					
				default :
				   // statements
				   break;
			}
		}
		
		/**
		 * The fault method is called when the delegate receives a fault from the service
		 * 
		 * @param event
		 */		
		public function fault(  event : Object  ) : void {
			
			log.error( event.text);
		}
		
		
		/**
		 * Method is called when the delegate receives a disconnect notice from the server 
		 * @param reason
		 * @param message
		 * 
		 */		
		private function serverDisconnect(reason : uint, message : String) : void 
		{
			close();
		}		
		
		/**
		 * Gets called when the server has disconnected 
		 * 
		 */		
		public function close() : void {
			if (participantsSO != null) participantsSO.close();
		}
		
		/**
		 * Joins a room on the server 
		 * 
		 */		
		private function joinMeetMeRoom() : void
		{
			participantsSO = SharedObject.getRemote("meetMeUsersSO", proxy.getUri(), false);
			participantsSO.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
			participantsSO.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
			participantsSO.addEventListener(SyncEvent.SYNC, sharedObjectSyncHandler);
			
			participantsSO.client = this;
			participantsSO.connect(proxy.getConnection());			
		}

		/**
		 * This event is called when a new user has joined a room on the server 
		 * @param userId
		 * @param cidName
		 * @param cidNum
		 * @param muted
		 * @param talking
		 * 
		 */
		public function userJoin(userId : Number, cidName : String, cidNum : String, 
									muted : Boolean, talking : Boolean) : void
		{
			if (participants == null) participants = new Array();
			
			// Only add new participants to our array
			var isNew : Boolean = true;
			for (var i:int = 0; i < participants.length; i++)
			{
				if (participants[i].userid == userId) {
					isNew = false;
				}
			}
				
			if (isNew) {
				if (cidName == null) cidName = "unknown"; 
				participants.push({callerName : cidName, isMuted : muted, isTalking : talking, userid : userId});
			}

			participants.sortOn("callerName", Array.CASEINSENSITIVE);
				
			meetMeRoom.dpParticipants = new ArrayCollection(participants);
			meetMeRoom.dpParticipants.refresh();
		}

		/**
		 * Gets called when a particular user was muted/unmuted
		 * @param userId - The user
		 * @param mute - mute?
		 * 
		 */
		public function userMute(userId : Number, mute : Boolean) : void
		{
			if (participants == null) return;
			
			for (var i:int = 0; i < participants.length; i++)
			{
				if (participants[i].userid == userId) {
					participants[i].isMuted = mute;					
					sendNewMeetMeEvent();
				}
			}			
		}

		/**
		 *  Method gets called when a user is talking
		 * @param userId - the user who is talking
		 * @param talk
		 * 
		 */
		public function userTalk(userId : Number, talk : Boolean) : void
		{
			//log.voice("User Talking");
			if (participants == null) return;
			
			for (var i:int = 0; i < participants.length; i++)
			{
				if (participants[i].userid == userId) {
					participants[i].isTalking = talk;					
					sendNewMeetMeEvent();
				}
			}			
		}

		/**
		 * Method gets called when the user has left 
		 * @param userId - the user which left the room
		 * 
		 */
		public function userLeft(userId : Number) : void
		{
			if (participants == null) return;
			
			participants = meetMeRoom.dpParticipants.toArray();
			
			var currentUsers : Array = new Array();
			
			for (var i:int = 0; i < meetMeRoom.dpParticipants.length; i++)
			{
				if (meetMeRoom.dpParticipants[i].userid == userId) {			
					meetMeRoom.dpParticipants.removeItemAt(i);		
				}
			}	
			
			meetMeRoom.dpParticipants.refresh();	
		}
		
		/**
		 * Mute or Unmute a specific user 
		 * @param userId - the user to mute/unmute
		 * @param muteUser - mute/unmute?
		 * 
		 */		
		public function muteUnmuteUser(note:MuteNotifier) : void
		{
			var nc_responder : Responder;
			nc_responder = new Responder(getMeetMeUsers, null);
					
			log.voice("VoiceConfConnectResponder: calling meetmeService.muteUnmuteUser" + " userid:" + note.userid);
			proxy.getConnection().call("meetmeService.muteUnmuteUser", nc_responder, note.userid, note.muteUser);			
		}

		/**
		 * Send a call to the server to mute all users 
		 * @param muteUSers
		 * 
		 */		
		public function muteAllUsers(mute : Boolean) : void
		{	
			log.voice("MeetMe: calling meetmeService.muteAllUsers");
			proxy.getConnection().call("meetmeService.muteAllUsers", null, mute);			
		}
		
		/**
		 * Ejects a particular user 
		 * @param userId - the user to eject
		 * 
		 */
		public function ejectUser(userId : Number) : void
		{
			log.voice("MeetMe: calling meetmeService.ejectUser");
			proxy.getConnection().call("meetmeService.ejectUser", null, userId);			
		}
		
		/**
		 * Gets all the users in the room on the server and then refreshes the ArrayCollection of users
		 * which is stored in the MeetMeRoom class 
		 * @param meetmeUser
		 * 
		 */		
		public function getMeetMeUsers(meetmeUser : Object) : void
		{
			var i:Number = 0;
			
			if (participants == null) participants = new Array();
							
			for(var items:String in meetmeUser) 
			{
				var userId : String = meetmeUser[items][0];
				var cidName : String = meetmeUser[items][1];	
				var cidNum : String  = meetmeUser[items][2];
				var muted : Boolean = meetmeUser[items][3];
				var talking : Boolean = meetmeUser[items][4];
				
				if (cidName == null) cidName = "unknown";
				
				participants.push({callerName : cidName, isMuted : muted, isTalking : talking, userid : userId});

				i++;
			}			

			participants.sortOn("callerName", Array.CASEINSENSITIVE);
			
			log.voice("Getting users for refresh");
			meetMeRoom.dpParticipants = new ArrayCollection(participants);
			meetMeRoom.dpParticipants.refresh();
		}
			
		/**
		 * Responds to a SYNC event of a shared object 
		 * @param event
		 * 
		 */			
		private function sharedObjectSyncHandler( event : SyncEvent) : void
		{
			log.voice( "MeetMe::sharedObjectSyncHandler " + event.changeList);
		}
		
		/**
		 * Responds to a NET_STATUS_EVENT of a shared object 
		 * @param event
		 * 
		 */		
		private function netStatusHandler ( event : NetStatusEvent ) : void
		{
			log.voice( "MeetMe::netStatusHandler " + event.info.code );
		}
		
		/**
		 * Responds to an ASYNC_ERROR_EVENT of a shared object 
		 * @param event
		 * 
		 */		
		private function asyncErrorHandler ( event : AsyncErrorEvent ) : void
		{
			log.voice( "MeetMe::asyncErrorHandler " + event.error);
		}
		
		/**
		 * The method is called when a new event is received from the server
		 * <p>
		 * This method then sends out a notification to the rest of the module
		 * 
		 */		
		public function sendNewMeetMeEvent():void
		{
			//log.voice("Got to sendMeetMeEvent");
			sendNotification(VoiceConferenceFacade.USER_JOIN_EVENT);
		}		
	}
}
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
package org.bigbluebutton.modules.viewers.model.services
{
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SyncEvent;
	import flash.net.NetConnection;
	import flash.net.SharedObject;
	
	import org.bigbluebutton.modules.log.LogModuleFacade;
	import org.bigbluebutton.modules.viewers.ViewersFacade;
	import org.bigbluebutton.modules.viewers.controller.notifiers.StatusNotifier;
	import org.bigbluebutton.modules.viewers.model.business.Conference;
	import org.bigbluebutton.modules.viewers.model.vo.User;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
	
	/**
	 * 
	 * @author
	 * 
	 */	
	public class SharedObjectConferenceDelegate extends Proxy implements IProxy
	{
		public static const NAME:String = "SharedObjectConferenceDelegate";
		
		private var _conference : Conference;
		private var _connection : NetConnection;
		private var _participantsSO : SharedObject;
		private var _ncDelegate : NetConnectionDelegate;
		private var log:LogModuleFacade = LogModuleFacade.getInstance("LogModule");
		private static const SO_NAME : String = "participantsSO";
		
		/**
		 * Creates a new SharedObjectConferenceDelegate object 
		 * @param conference - A Conference object
		 * 
		 */		
		public function SharedObjectConferenceDelegate(conference:Conference)
		{
			super(NAME);
			_conference = conference;	
		}
		
		/**
		 * Updates the user status in the conference object, and sends the update to the server shared object 
		 * @param newStatus
		 * 
		 */		
		public function sendNewStatus(newStatus : String) : void {
			_conference.me.status = newStatus;
	
			var id : Number = _conference.me.userid;			
			var aUser:User = _conference.getParticipant(id);			
			if (aUser != null) {
				// This sets this user's status
				aUser.status = newStatus;
				_participantsSO.setProperty(id.toString(), aUser);
				_participantsSO.setDirty(id.toString());
			}
		}

		/**
		 * Sends the broadcast stream to the server 
		 * @param hasStream
		 * @param streamName
		 * 
		 */		
		public function sendBroadcastStream(hasStream : Boolean, streamName : String) : void {
			var id : Number = _conference.me.userid;
			var aUser : User = _conference.getParticipant(id);			
			
			if (aUser != null) {
				// This sets the users stream
				aUser.hasStream = hasStream;
				aUser.streamName = streamName;
				_participantsSO.setProperty(id.toString(), aUser);
				_participantsSO.setDirty(id.toString());
				
				log.viewer( "Conference::sendBroadcastStream::found =[" + id + "," 
						+ aUser.hasStream + "," + aUser.streamName + "]");				
			}
		}
	
		public function broadcastStream(id : Number, hasStream : Boolean, streamName : String) : void
		{
			var aUser : User = _conference.getParticipant(id);			
			if (aUser != null) {
				aUser.hasStream = hasStream;
				aUser.streamName = streamName;
			}		
		}
				
		/**
		 * Join the server, connect 
		 * @param host
		 * @param username
		 * @param password
		 * @param room
		 * 
		 */		
		public function join(host : String, username : String, password : String, room : String) : void
		{
			_connection = new NetConnection();
			_connection.client = this;
			
			_conference.host = host;
			_conference.room = room;
			_conference.me.name = username;
			
			_ncDelegate = new NetConnectionDelegate(this);
			_ncDelegate.connect(host, room, username, password);
		}
		
		/**
		 * Return the NetConnection object which handles the server connection details 
		 * @return 
		 * 
		 */		
		public function get netConnection() : NetConnection
		{
			return _connection;
		}
		
		public function disconnected(reason : String) : void
		{
			_conference.connected = false;
			_conference.connectFailReason = reason;
			sendNotification(ViewersFacade.CONNECT_UNSUCCESSFUL, reason);
		}
		
		public function connected() : void
		{
			_conference.connected = true;
			_conference.connectFailReason = null;
			
			joinConference();
			
			sendNotification(ViewersFacade.CONNECT_SUCCESS);
		}
		
		/**
		 * Join a conference room on the server 
		 * 
		 */		
		private function joinConference() : void
		{
			// Start with a fresh list
			_conference.removeAllParticipants();
			
			_participantsSO = SharedObject.getRemote(SO_NAME, _conference.host, false);
			
			_participantsSO.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
			_participantsSO.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
			_participantsSO.addEventListener(SyncEvent.SYNC, sharedObjectSyncHandler);
			
			_participantsSO.client = this;

			_participantsSO.connect(_connection);
		}

		/**
		 * Leave the conference 
		 * 
		 */		
		public function leave() : void
		{
			removeListeners();
			_participantsSO.close();
			_ncDelegate.disconnect();
			
			// Cleanup list of participants
			_conference.removeAllParticipants();		
		}

		/**
		 * Remove the listeners for the participantsSO shared object 
		 * 
		 */		
		private function removeListeners() : void
		{
			_participantsSO.removeEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
			_participantsSO.removeEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
			_participantsSO.removeEventListener(SyncEvent.SYNC, sharedObjectSyncHandler);
		}			

		/**
		 * Called when a sync_event is received for the SharedObject 
		 * @param event
		 * 
		 */		
		private function sharedObjectSyncHandler( event : SyncEvent) : void
		{
			log.viewer( "Conference::sharedObjectSyncHandler " + event.changeList.length);
			
			for (var i : uint = 0; i < event.changeList.length; i++) 
			{
				log.viewer( "Conference::handlingChanges[" + event.changeList[i].name + "][" + i + "]");
				handleChangesToSharedObject(event.changeList[i].code, 
						event.changeList[i].name, event.changeList[i].oldValue);
			}
		}

		/**
		 * See flash.events.SyncEvent
		 */
		private function handleChangesToSharedObject(code : String, name : String, oldValue : Object) : void
		{
			switch (code)
			{
				case "clear":
					/** From flash.events.SyncEvent doc
					 * 
					 * A value of "clear" means either that you have successfully connected 
					 * to a remote shared object that is not persistent on the server or the 
					 * client, or that all the properties of the object have been deleted -- 
					 * for example, when the client and server copies of the object are so 
					 * far out of sync that Flash Player resynchronizes the client object 
					 * with the server object. In the latter case, SyncEvent.SYNC is dispatched 
					 * and the "code" value is set to "change". 
					 */
					 
					_conference.removeAllParticipants();
													
					break;	
																			
				case "success":
					/** From flash.events.SyncEvent doc
					 * 	 A value of "success" means the client changed the shared object. 		
					 */
					
					// do nothing... just log it 
					log.viewer( "Conference::success =[" + name + "," 
							+ _participantsSO.data[name].status + ","
							+ _participantsSO.data[name].hasStream
							+ "]");	
					break;

				case "reject":
					/** From flash.events.SyncEvent doc
					 * 	A value of "reject" means the client tried unsuccessfully to change the 
					 *  object; instead, another client changed the object.		
					 */
					
					// do nothing... just log it 
					// Or...maybe we should check if the value is the same as what we wanted it
					// to be..if not...change it?
					log.viewer( "Conference::reject =[" + code + "," + name + "," + oldValue + "]");	
					break;

				case "change":
					/** From flash.events.SyncEvent doc
					 * 	A value of "change" means another client changed the object or the server 
					 *  resynchronized the object.  		
					 */
					 
					if (name != null) {						
						if (_conference.hasParticipant(_participantsSO.data[name].userid)) {
							var changedUser : User = _conference.getParticipant(Number(name));
							changedUser.status = _participantsSO.data[name].status;
							changedUser.hasStream = _participantsSO.data[name].hasStream;
							changedUser.streamName = _participantsSO.data[name].streamName;	

							log.viewer( "Conference::change =[" + 
								name + "," + changedUser.name + "," + changedUser.hasStream + "]");
																					
						} else {
							// The server sent us a new user.
							var user : User = new User();
							user.userid = _participantsSO.data[name].userid;
							user.name = _participantsSO.data[name].name;
							user.status = _participantsSO.data[name].status;
							user.hasStream = _participantsSO.data[name].hasStream;
							user.streamName = _participantsSO.data[name].streamName;							
							user.role = _participantsSO.data[name].role;						
							
							log.viewer( "Conference::change::newuser =[" + 
								name + "," + user.name + "," + user.hasStream + "]");
							
							_conference.addUser(user);
						}
						
					} else {
						//log.warn( "Conference::SO::change is null");
					}
																	
					break;

				case "delete":
					/** From flash.events.SyncEvent doc
					 * 	A value of "delete" means the attribute was deleted.  		
					 */
					
					log.viewer( "Conference::delete =[" + code + "," + name + "," + oldValue + "]");	
					
					// The participant has left. Cast name (string) into a Number.
					_conference.removeParticipant(Number(name));
					break;
										
				default:	
					log.viewer( "Conference::default[" + _participantsSO.data[name].userid
								+ "," + _participantsSO.data[name].name + "]");		 
					break;
			}
		}
		
		/**
		 * Called when a net_statu_event is received 
		 * @param event
		 * 
		 */		
		private function netStatusHandler ( event : NetStatusEvent ) : void
		{
			log.viewer( "Conference::netStatusHandler " + event.info.code );
		}
		
		/**
		 * Called when an async_error_handler is called 
		 * @param event
		 * 
		 */		
		private function asyncErrorHandler ( event : AsyncErrorEvent ) : void
		{
			log.viewer( "Conference::asyncErrorHandler " + event.error);
		}

		/**
		 * send a new user status message 
		 * @param userid
		 * @param newStatus
		 * 
		 */		
		public function sendNewUserStatusEvent(userid : Number, newStatus : String):void
		{
			//var event : StatusChangeEvent = 
			//		new StatusChangeEvent(userid, newStatus);
			//event.dispatch();
			sendNotification(ViewersFacade.CHANGE_STATUS, new StatusNotifier(userid, newStatus));
		}	
		
		/**
	 	*  Callback from server
	 	*/
		public function setUserIdAndRole(id : Number, role : String ) : String
		{
			log.viewer( "SOConferenceDelegate::setConnectionId: id=[" + id + "]");
			if( isNaN( id ) ) return "FAILED";
			
			_conference.me.userid = id;
			_conference.me.role = role;
									
			return "OK";
		}	
	}
}
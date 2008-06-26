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
	import flash.events.*;
	import flash.net.NetConnection;
	
	import org.bigbluebutton.modules.voiceconference.VoiceConferenceFacade;
	import org.bigbluebutton.modules.voiceconference.control.notifiers.MuteNotifier;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
		
	/**
	 *  This is the NetConnectionDelegate which connects to the server
	 * <p>
	 * This class extends the Proxy Class of the PureMVC framework
	 * @author dev_team@bigbluebutton.org
	 * 
	 */	
	public class NetConnectionDelegate extends Proxy implements IProxy
	{
		public static const NAME:String = "NetConnectionDelegate";
			
		private var netConnection : NetConnection;	
		private var meetmeRoomURI:String;
		private var roomNumber : String;
					
		/**
		 * The Default constructor 
		 * @param meetmeRoom - the MeetMeRoom this class uses
		 * 
		 */					
		public function NetConnectionDelegate(meetmeRoomURI:String)
		{
			super(NAME);
			this.meetmeRoomURI = meetmeRoomURI;
		}

		/**
		 * Attempts connect to the server 
		 * 
		 */
		public function connect(nc:NetConnection) : void
		{
			netConnection = nc;
			
			netConnection.client = this;
			
			// Setup the NetConnection and listen for NetStatusEvent and SecurityErrorEvent events.
			netConnection.addEventListener( NetStatusEvent.NET_STATUS, netStatus );
			netConnection.addEventListener( AsyncErrorEvent.ASYNC_ERROR, netASyncError );
			netConnection.addEventListener( SecurityErrorEvent.SECURITY_ERROR, netSecurityError );
			netConnection.addEventListener( IOErrorEvent.IO_ERROR, netIOError );
			
			// connect to server
			try {
				//log.info( "Connecting to <b>" + meetmeRoomURI + "</b>");
				netConnection.connect( meetmeRoomURI, true );
			} catch( e : ArgumentError ) {
				// Invalid parameters.
				switch ( e.errorID ) 
				{
					case 2004 :						
						//log.error( "Invalid server location: <b>" + meetmeRoomURI + "</b>");											   
						break;
						
					default :
					   //
					   break;
				}
			}	
		}
		
		/**
		 * Closes the connection to the server
		 * 
		 */		
		public function close() : void
		{
			// Close the NetConnection.
			sendNotification(VoiceConfConnectResponder.CLOSE);
			netConnection.close();
		}
				
		/**
		 * This method gets called when a NET_STATUS event is received from the server
		 * @param event
		 */		
		protected function netStatus( event : NetStatusEvent ) : void 
		{
			sendNotification(VoiceConfConnectResponder.RESULT, event);
		}
		
		/**
		 * This method gets called when a NET_SECURITY_ERROR is received from the server
		 * @param event
		 */	
		protected function netSecurityError( event : SecurityErrorEvent ) : void 
		{
			sendNotification(VoiceConfConnectResponder.FAULT, 
			new SecurityErrorEvent(SecurityErrorEvent.SECURITY_ERROR, false, true,
		    										  "Security error - " + event.text ) );
		}
		
		/**
		 * This method gets called when an IO_ERROR event is received from the server
		 * @param event
		 */		
		protected function netIOError( event : IOErrorEvent ) : void 
		{
			sendNotification(VoiceConfConnectResponder.FAULT, 
			new IOErrorEvent( IOErrorEvent.IO_ERROR, false, true, 
							 "Input/output error - " + event.text ) );
		}
		
		/**
		 * This method gets called when an ASYNC_ERROR event is received from the server
		 * @param event
		 */		
		protected function netASyncError( event : AsyncErrorEvent ) : void 
		{
			sendNotification(VoiceConfConnectResponder.FAULT, 
			new AsyncErrorEvent ( AsyncErrorEvent.ASYNC_ERROR, false, true,
							 "Asynchronous code error - <i>" + event.error + "</i>" ) );
		}
		
		/**
	 	*  Callback setID from server
	 	*/
		public function setRoomNumber( room : String ):*
		{
			//log.debug( "NetconnectionDelegate::setRoomNumber:room = " + room );
			roomNumber = room;
			
			return "Okay";
		}
		
		/**
		 *  
		 * @return the URI of the MeetMeRoom
		 * 
		 */		
		public function getUri() : String{
			return meetmeRoomURI;
		}	
		
		/**
		 * 
		 * @return the NetConnection of this class
		 * 
		 */		
		public function getConnection() : NetConnection
		{
			return netConnection;
		}
		
		/**
		 * Send a call to the server to mute all users 
		 * @param muteUSers
		 * 
		 */		
		public function muteAllUsers(muteUsers : Boolean) : void 
		{
			sendNotification(VoiceConferenceFacade.MUTE_ALL_USERS_COMMAND, muteUsers);
		}
		
		/**
		 * Mute or Unmute a specific user 
		 * @param userId - the user to mute/unmute
		 * @param muteUser - mute/unmute?
		 * 
		 */		
		public function muteUnmuteUser(userId : Number, muteUser : Boolean) : void
		{
			//log.debug("NetConnectionDelegate::muteUnmuteUser : [" + userId + "," + muteUser + "]");
			sendNotification(VoiceConferenceFacade.MUTE_UNMUTE_USER_COMMAND, new MuteNotifier(userId, muteUser));
		}

		/**
		 * Ejects a particular user 
		 * @param userId - the user to eject
		 * 
		 */
		public function ejectUser(userId : Number) : void
		{
			//log.debug("NetConnectionDelegate::ejectUser : [" + userId + "]");
			sendNotification(VoiceConferenceFacade.EJECT_USER_COMMAND, userId);
		}
	}
}
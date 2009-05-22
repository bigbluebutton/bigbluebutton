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
	import flash.events.*;
	import flash.net.NetConnection;
	import flash.net.Responder;
	import flash.utils.Timer;
	
	import org.bigbluebutton.modules.viewers.ViewersFacade;
	import org.bigbluebutton.modules.viewers.ViewersModuleConstants;

		
	public class NetConnectionDelegate
	{
		public static const NAME:String = "NetConnectionDelegate";
		
		public static const CONNECT_SUCCESS:String = "NetConnection.Connect.Success";
		public static const CONNECT_FAILED:String = "NetConnection.Connect.Failed";
		public static const CONNECT_CLOSED:String = "NetConnection.Connect.Closed";
		public static const INVALID_APP:String = "NetConnection.Connect.InvalidApp";
		public static const APP_SHUTDOWN:String = "NetConnection.Connect.AppShutDown";
		public static const CONNECT_REJECTED:String = "NetConnection.Connect.Rejected";

		private var _netConnection:NetConnection;	
		private var connectionId:Number;
		private var connected:Boolean = false;
		private var _connectionSuccessListener:Function;
		private var _connectionFailedListener:Function;
		
		private var _userid:Number = -1;
		private var _role:String = "unknown";
		private var _module:ViewersModule;
		
		// These two are just placeholders. We'll get this from the server later and
		// then pass to other modules.
		private var _authToken:String = "AUTHORIZED";
		private var _room:String;
		private var tried_tunneling:Boolean = false;
				
		public function NetConnectionDelegate(m:ViewersModule) : void
		{
			_module = m;
		}
		
		public function get connection():NetConnection {
			return _netConnection;
		}
		
		public function addConnectionSuccessListener(connectionListener:Function):void{
			_connectionSuccessListener = connectionListener;
		}
		
		public function addConnectionFailedListener(connectionListener:Function):void{
			_connectionFailedListener = connectionListener;
		}
		
		/**
		 * Connect to the server.
		 * uri: The uri to the conference application.
		 * username: Fullname of the participant.
		 * role: MODERATOR/VIEWER
		 * conference: The conference room
		 * mode: LIVE/PLAYBACK - Live:when used to collaborate, Playback:when being used to playback a recorded conference.
		 * room: Need the room number when playing back a recorded conference. When LIVE, the room is taken from the URI.
		 */
		public function connect(username:String, role:String, conference:String, mode:String, room:String, tunnel:Boolean=false):void
		{	
			tried_tunneling = tunnel;	
			_netConnection = new NetConnection();				
			_netConnection.client = this;
			_netConnection.addEventListener( NetStatusEvent.NET_STATUS, netStatus );
			_netConnection.addEventListener( AsyncErrorEvent.ASYNC_ERROR, netASyncError );
			_netConnection.addEventListener( SecurityErrorEvent.SECURITY_ERROR, netSecurityError );
			_netConnection.addEventListener( IOErrorEvent.IO_ERROR, netIOError );
			
			try {	
				var uri:String = _module.uri;
//				if (tunnel) {
//					uri = uri.replace(/rtmp:/g, "rtmpt:");
//				}
								
				LogUtil.debug(NAME + "::Connecting to " + uri + " [" + username + "," + role + "," + conference + 
						"," + mode + "," + room + "]");		
				_netConnection.connect(uri, username, role, conference, mode, room, _module.voicebridge, _module.record);			
				
			} catch( e : ArgumentError ) {
				// Invalid parameters.
				switch ( e.errorID ) 
				{
					case 2004 :						
						LogUtil.debug("Error! Invalid server location: " + uri);											   
						break;						
					default :
					   break;
				}
			}	
		}
			
		public function disconnect() : void
		{
			_netConnection.close();
		}
					
		protected function netStatus( event : NetStatusEvent ) : void 
		{
			handleResult( event );
		}
		
		public function handleResult(  event : Object  ) : void {
			var info : Object = event.info;
			var statusCode : String = info.code;
			switch ( statusCode ) 
			{
				case CONNECT_SUCCESS :
					LogUtil.debug(NAME + ":Connection to viewers application succeeded.");
					_netConnection.call(
							"getMyUserId",// Remote function name
							new Responder(
	        					// result - On successful result
								function(result:Object):void { 
									LogUtil.debug("Successful result: " + result); 
									_userid = Number(result);
									if (_userid >= 0) {
										_connectionSuccessListener(true, {userid:_userid});	
									}	
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
			
					break;
			
				case CONNECT_FAILED :					
					if (tried_tunneling) {
						LogUtil.debug(NAME + ":Connection to viewers application failed...even when tunneling");
						_connectionSuccessListener(false, null, ViewersModuleConstants.CONNECT_FAILED);
					} else {
						disconnect();
						_netConnection = null;
						LogUtil.debug(NAME + ":Connection to viewers application failed...try tunneling");
						var rtmptRetryTimer:Timer = new Timer(1000, 1);
            			rtmptRetryTimer.addEventListener("timer", rtmptRetryTimerHandler);
            			rtmptRetryTimer.start();						
					}									
					break;
					
				case CONNECT_CLOSED :	
					LogUtil.debug(NAME + ":Connection to viewers application closed");					
					_connectionSuccessListener(false, null, ViewersModuleConstants.CONNECT_CLOSED);								
					break;
					
				case INVALID_APP :	
					LogUtil.debug(NAME + ":viewers application not found on server");			
					_connectionSuccessListener(false, null, ViewersModuleConstants.INVALID_APP);				
					break;
					
				case APP_SHUTDOWN :
					LogUtil.debug(NAME + ":viewers application has been shutdown");
					_connectionSuccessListener(false, null, ViewersModuleConstants.APP_SHUTDOWN);	
					break;
					
				case CONNECT_REJECTED :
					LogUtil.debug(NAME + ":No permissions to connect to the viewers application" );
					_connectionSuccessListener(false, null, ViewersModuleConstants.CONNECT_REJECTED);		
					break;
					
				default :
				   LogUtil.debug(NAME + ":Default status to the viewers application" );
					_connectionSuccessListener(false, null, ViewersModuleConstants.UNKNOWN_REASON);
				   break;
			}
		}
		
		private function rtmptRetryTimerHandler(event:TimerEvent):void {
            LogUtil.debug(NAME + "rtmptRetryTimerHandler: " + event);
            connect(_module.username, _module.role, _module.conference, _module.mode, _module.room, true);
        }
        
		private function sendFailReason(reason:String):void{
			ViewersFacade.getInstance().sendNotification(ViewersModuleConstants.LOGIN_FAILED, reason);
		}
		
			
		protected function netSecurityError( event : SecurityErrorEvent ) : void 
		{
			LogUtil.debug("Security error - " + event.text);
			_connectionSuccessListener(false, null, ViewersModuleConstants.UNKNOWN_REASON);
		}
		
		protected function netIOError( event : IOErrorEvent ) : void 
		{
			LogUtil.debug("Input/output error - " + event.text);
			_connectionSuccessListener(false, null, ViewersModuleConstants.UNKNOWN_REASON);
		}
			
		protected function netASyncError( event : AsyncErrorEvent ) : void 
		{
			LogUtil.debug("Asynchronous code error - " + event.error );
			_connectionSuccessListener(false, null, ViewersModuleConstants.UNKNOWN_REASON);
		}	

		/**
	 	*  Callback from server
	 	*/
		public function setUserId(id:Number, role:String):String
		{
			LogUtil.debug( "ViewersNetDelegate::setConnectionId: id=[" + id + "," + role + "]");
			if (isNaN(id)) return "FAILED";
			
			// We should be receiving authToken and room from the server here.
			_userid = id;								
			return "OK";
		}
	}
}
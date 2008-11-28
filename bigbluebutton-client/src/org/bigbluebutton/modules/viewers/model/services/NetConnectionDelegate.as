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
	
	import org.bigbluebutton.modules.viewers.ViewersFacade;
	import org.bigbluebutton.modules.viewers.ViewersModuleConstants;

		
	public class NetConnectionDelegate
	{
		public static const NAME : String = "NetConnectionDelegate";
		
		public static const CONNECT_SUCCESS:String = "NetConnection.Connect.Success";
		public static const CONNECT_FAILED:String = "NetConnection.Connect.Failed";
		public static const CONNECT_CLOSED:String = "NetConnection.Connect.Closed";
		public static const INVALID_APP:String = "NetConnection.Connect.InvalidApp";
		public static const APP_SHUTDOWN:String = "NetConnection.Connect.AppShutDown";
		public static const CONNECT_REJECTED:String = "NetConnection.Connect.Rejected";

		private var _netConnection : NetConnection;	
		private var _uri : String;
		private var connectionId : Number;
		private var connected : Boolean = false;
		private var _connectionSuccessListener:Function;
		private var _connectionFailedListener:Function;
		
		private var _userid:Number = -1;
		private var _role:String = "unknown";
		
		// These two are just placeholders. We'll get this from the server later and
		// then pass to other modules.
		private var _authToken:String = "AUTHORIZED";
		private var _room:String;
				
		public function NetConnectionDelegate(uri:String) : void
		{
			_netConnection = new NetConnection();
			_uri = uri;
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
		
		public function connect(uri:String, room:String, 
					username:String, password:String) : void
		{	
			// Just store the room temporarily...later this will be returned by the server
			// together with the authToken. (ralam - oct. 30, 2008)
			_room = room;
							
			_netConnection.client = this;
			_netConnection.addEventListener( NetStatusEvent.NET_STATUS, netStatus );
			_netConnection.addEventListener( AsyncErrorEvent.ASYNC_ERROR, netASyncError );
			_netConnection.addEventListener( SecurityErrorEvent.SECURITY_ERROR, netSecurityError );
			_netConnection.addEventListener( IOErrorEvent.IO_ERROR, netIOError );
			
			try {							
				_netConnection.connect(_uri, room, username, password );				
				
			} catch( e : ArgumentError ) {
				// Invalid parameters.
				switch ( e.errorID ) 
				{
					case 2004 :						
						LogUtil.debug("Error! Invalid server location: " + _uri);											   
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
					if ((_userid >= 0) && (_role != "unknown")) {
						_connectionSuccessListener(true, {userid:_userid, role:_role, room:_room, authToken:_authToken});	
					}				
					break;
			
				case CONNECT_FAILED :
					LogUtil.debug(NAME + ":Connection to viewers application failed");
					_connectionSuccessListener(false, null, ViewersModuleConstants.CONNECT_FAILED);									
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
		public function setUserIdAndRole(id:Number, role:String ):String
		{
			LogUtil.debug( "ViewersNetDelegate::setConnectionId: id=[" + id + ", " + role + "]");
			if (isNaN(id)) return "FAILED";
			
			// We should be receiving authToken and room from the server here.
			_userid = id;
			_role = role;
								
			return "OK";
		}
	}
}
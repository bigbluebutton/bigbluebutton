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

		
	public class NetConnectionDelegate
	{
		public static const NAME : String = "NetConnectionDelegate";

		private var _netConnection : NetConnection;	
		private var _uri : String;
		private var connectionId : Number;
		private var connected : Boolean = false;
		private var _connectionListener:Function;
		
		private var _userid:Number = -1;
		private var _role:String = "unknown";
		
		// These two are just placeholders. We'll get this from the server later and
		// then pass to other modules.
		private var _authToken:String = "AUTHORIZED";
		private var _room:String;
				
		public function NetConnectionDelegate(uri:String, connectionListener:Function) : void
		{
			_netConnection = new NetConnection();
			_uri = uri;
			_connectionListener = connectionListener;
		}
		
		public function get connection():NetConnection {
			return _netConnection;
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
				trace( "Connecting to " + _uri + " " + room + " " + username + " " + password);								
				_netConnection.connect(_uri, room, username, password );				
				
			} catch( e : ArgumentError ) {
				// Invalid parameters.
				switch ( e.errorID ) 
				{
					case 2004 :						
						trace("Error! Invalid server location: " + _uri);											   
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
				case "NetConnection.Connect.Success" :
					trace("Connection to viewers application succeeded.");
					if ((_userid > 0) && (_role != "unknown")) {
						_connectionListener(true, _userid, _role, _room, _authToken);	
					}				
					break;
			
				case "NetConnection.Connect.Failed" :
					trace("Connection to viewers application failed");
					_connectionListener(false);										
					break;
					
				case "NetConnection.Connect.Closed" :	
					trace("Connection to viewers application closed");				
					_connectionListener(false);										
					break;
					
				case "NetConnection.Connect.InvalidApp" :	
					trace("viewers application not found on server");			
					_connectionListener(false);					
					break;
					
				case "NetConnection.Connect.AppShutDown" :
					trace("viewers application has been shutdown");
					_connectionListener(false);					
					break;
					
				case "NetConnection.Connect.Rejected" :
					trace("No permissions to connect to the viewers application" );
					_connectionListener(false);					
					break;
					
				default :
				   trace("Default status to the viewers application" );
					_connectionListener(false);
				   break;
			}
		}
		
			
		protected function netSecurityError( event : SecurityErrorEvent ) : void 
		{
			trace("Security error - " + event.text);
			_connectionListener(false);
		}
		
		protected function netIOError( event : IOErrorEvent ) : void 
		{
			trace("Input/output error - " + event.text);
			_connectionListener(false);
		}
			
		protected function netASyncError( event : AsyncErrorEvent ) : void 
		{
			trace("Asynchronous code error - " + event.error );
			_connectionListener(false);
		}	

		/**
	 	*  Callback from server
	 	*/
		public function setUserIdAndRole(id:Number, role:String ):String
		{
			trace( "ViewersNetDelegate::setConnectionId: id=[" + id + ", " + role + "]");
			if (isNaN(id)) return "FAILED";
			
			// We should be receiving authToken and room from the server here.
			_userid = id;
			_role = role;
								
			return "OK";
		}
	}
}
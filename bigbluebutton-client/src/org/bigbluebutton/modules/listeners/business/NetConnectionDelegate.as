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
package org.bigbluebutton.modules.listeners.business
{
	import flash.events.*;
	import flash.net.NetConnection;
	import flash.net.Responder;
	import org.bigbluebutton.common.LogUtil;
		
	public class NetConnectionDelegate
	{
		public static const NAME:String = "ListenerNC";
		private static const LOGNAME:String = "[ListenerNC]";
		
		private var _netConnection:NetConnection;	
		private var _uri:String;
		private var connectionId:Number;
		private var connected:Boolean = false;
		private var _connectionListener:Function;
		private var _connectionError:Array;
				
		public function NetConnectionDelegate(uri:String, connectionListener:Function) : void
		{
			_netConnection = new NetConnection();
			_uri = uri;
			_connectionListener = connectionListener;
		}
		
		public function get connection():NetConnection {
			return _netConnection;
		}
		
		public function connect() : void
		{					
			_netConnection.client = this;
			_netConnection.addEventListener( NetStatusEvent.NET_STATUS, netStatus );
			_netConnection.addEventListener( AsyncErrorEvent.ASYNC_ERROR, netASyncError );
			_netConnection.addEventListener( SecurityErrorEvent.SECURITY_ERROR, netSecurityError );
			_netConnection.addEventListener( IOErrorEvent.IO_ERROR, netIOError );
			
			try {
				LogUtil.debug(LOGNAME + "Connecting to " + _uri);	
				_connectionError = null;							
				_netConnection.connect(_uri );
				
			} catch( e : ArgumentError ) {
				// Invalid parameters.
				switch ( e.errorID ) 
				{
					case 2004 :						
						LogUtil.error(LOGNAME + "Error! Invalid server location: " + _uri);											   
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

		public function muteAllUsers(mute:Boolean):void 
		{
			LogUtil.info(LOGNAME + "Muting all listeners [" + mute + "]");
			_netConnection.call("meetmeService.muteAllUsers", null, mute);
		}
		
		public function muteUnmuteUser(userid:Number, mute:Boolean):void
		{
			LogUtil.info(LOGNAME + "Muting listener [" + userid + "," + mute + "]");
			_netConnection.call("meetmeService.muteUnmuteUser", null, userid, mute);
		}


		public function ejectUser(userid:Number) : void
		{
			LogUtil.info(LOGNAME + "Ejecting listener [" + userid + "]");
			_netConnection.call("meetmeService.ejectUser", null, userid);
		}		
		
		public function getCurrentListeners(resp:Responder):void {
			LogUtil.info(LOGNAME + "Getting current listeners.");
			_netConnection.call("meetmeService.getMeetMeUsers", resp);
		}
					
		protected function netStatus( event : NetStatusEvent ) : void 
		{
			handleResult(event);
		}
		
		public function handleResult(  event : Object  ) : void {
			var info:Object = event.info;
			var statusCode:String = info.code;
			
			switch ( statusCode ) 
			{
				case "NetConnection.Connect.Success" :
					LogUtil.info(LOGNAME + "Connection to voice application succeeded.");
					_connectionListener(true);					
					break;
			
				case "NetConnection.Connect.Failed" :
					LogUtil.error(LOGNAME + "Failed to connect to the application.");
					addError("Failed to connect to the application.");
					break;
					
				case "NetConnection.Connect.Closed" :
					LogUtil.error(LOGNAME + "Connection to application closed.");					
					addError("Connection to application closed.");			
					_connectionListener(false, _connectionError);
					break;
					
				case "NetConnection.Connect.InvalidApp" :
					LogUtil.error(LOGNAME + "Could not find the application.");				
					addError("Could not find the application.");
					break;
					
				case "NetConnection.Connect.AppShutDown":
					LogUtil.error(LOGNAME + "Application has shutdown.");
					addError("Application has shutdown.");
					break;
					
				case "NetConnection.Connect.Rejected":
					LogUtil.error(LOGNAME + "Connection to the application was rejected.");
					addError("Connection to the application was rejected.");
					break;
					
				default :
				   LogUtil.info("Voice NC: Default statuscode[" + statusCode + "]");
				   break;
			}
		}
		
			
		protected function netSecurityError( event : SecurityErrorEvent ) : void 
		{
			LogUtil.error(LOGNAME + "Encountered security error on connection to the application.");
			addError("Encountered security error on connection to the application.");
		}
		
		protected function netIOError( event : IOErrorEvent ) : void 
		{
			LogUtil.error(LOGNAME + "Encountered Input/Output error on connection to the application.");
			addError("Encountered Input/Output error on connection to the application.");
		}
			
		protected function netASyncError( event : AsyncErrorEvent ) : void 
		{
			LogUtil.error(LOGNAME + "Encountered Asynchronous error on connection to the application.");
			addError("Encountered Asynchronous error on connection to the application.");
		}	

		private function addError(error:String):void {
			if (_connectionError == null) {
				_connectionError = new Array();				
			} 			
			_connectionError.push(error);
		}
	}
}
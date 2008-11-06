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
package org.bigbluebutton.modules.voiceconference.model.service
{
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.net.SharedObject;

	public class VoiceSOService implements IVoiceService
	{
		public static const NAME:String = "VoiceSOService";
		
		private var voiceSO : SharedObject;
		private static const SHARED_OBJECT:String = "meetMeUsersSO";
		
		private var netConnectionDelegate: NetConnectionDelegate;
		private var _uri:String;
		private var _msgListener:Function;
		private var _connectionListener:Function;
		
		public function VoiceSOService(uri:String)
		{			
			_uri = uri;
			netConnectionDelegate = new NetConnectionDelegate(uri, connectionListener);			
		}
		
		public function connect(uri:String):void {
			_uri = uri
			netConnectionDelegate.connect();
		}
		
		public function disconnect():void {
			leave();
			netConnectionDelegate.disconnect();
		}
		
		private function connectionListener(connected:Boolean):void {
			if (connected) {
				trace(NAME + ":Connected to the VOice application");
				join();
			} else {
				leave();
				trace(NAME + ":Disconnected from the Voice application");
				notifyConnectionStatusListener(false);
			}
		}
		
	    private function join() : void
		{
			voiceSO = SharedObject.getRemote(SHARED_OBJECT, _uri, false);
			voiceSO.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
			voiceSO.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
			voiceSO.client = this;
			voiceSO.connect(netConnectionDelegate.connection);
			trace(NAME + ":Voice is connected to Shared object");
			notifyConnectionStatusListener(true);			
		}
		
	    private function leave():void
	    {
	    	if (voiceSO != null) voiceSO.close();
	    }

		public function addMessageListener(messageListener:Function):void {
			_msgListener = messageListener;
		}
		
		public function addConnectionStatusListener(connectionListener:Function):void {
			_connectionListener = connectionListener;
		}
		
		public function sendMessage(message:String):void
		{
			voiceSO.send("receiveNewMessage", message);
		}
			
		public function receiveNewMessage(message:String):void{
			if (_msgListener != null) {
				_msgListener( message);
			}		   
		}

		private function notifyConnectionStatusListener(connected:Boolean):void {
			if (_connectionListener != null) {
				trace('notifying connectionListener for Voice');
				_connectionListener(connected);
			} else {
				trace("_connectionListener is null");
			}
		}

		private function netStatusHandler ( event : NetStatusEvent ) : void
		{
			var statusCode : String = event.info.code;
			
			switch ( statusCode ) 
			{
				case "NetConnection.Connect.Success" :
					trace(NAME + ":Connection Success");		
					notifyConnectionStatusListener(true);			
					break;
			
				case "NetConnection.Connect.Failed" :			
					trace(NAME + ":Connection to voice SO failed");
					notifyConnectionStatusListener(false);
					break;
					
				case "NetConnection.Connect.Closed" :									
					trace(NAME + ":Connection to voice SO closed");
					notifyConnectionStatusListener(false);
					break;
					
				case "NetConnection.Connect.InvalidApp" :				
					trace(NAME + ":Voice application not found on server");
					notifyConnectionStatusListener(false);
					break;
					
				case "NetConnection.Connect.AppShutDown" :
					trace(NAME + ":Voice application has been shutdown");
					notifyConnectionStatusListener(false);
					break;
					
				case "NetConnection.Connect.Rejected" :
					trace(NAME + ":No permissions to connect to the voice application" );
					notifyConnectionStatusListener(false);
					break;
					
				default :
				   trace(NAME + ":default - " + event.info.code );
				   notifyConnectionStatusListener(false);
				   break;
			}
		}
			
		private function asyncErrorHandler ( event : AsyncErrorEvent ) : void
		{
			trace( "VoiceSO asyncErrorHandler " + event.error);
			notifyConnectionStatusListener(false);
		}
	}
}
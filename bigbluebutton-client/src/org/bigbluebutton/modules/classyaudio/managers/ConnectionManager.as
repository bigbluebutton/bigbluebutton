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

package org.bigbluebutton.modules.classyaudio.managers {
	
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.AsyncErrorEvent;
	import flash.events.Event;
	import flash.events.IEventDispatcher;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.external.*;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.modules.classyaudio.events.CallConnectedEvent;
	import org.bigbluebutton.modules.classyaudio.events.CallDisconnectedEvent;
	import org.bigbluebutton.modules.classyaudio.events.ConnectionStatusEvent;
	
	public class ConnectionManager {
			
		private  var netConnection:NetConnection = null;
		private var username:String;
		private var uri:String;
		private var uid:String;
		private var room:String;
		
		private var isConnected:Boolean = false;
		private var registered:Boolean = false;

		private var dispatcher:Dispatcher;
		
		public function ConnectionManager():void {
			dispatcher = new Dispatcher();
		}
		
		public function getConnection():NetConnection {
			return netConnection;
		}
		
		public function connect(uid:String, externUID:String, username:String, room:String, uri:String):void {
			if (isConnected) return;
			isConnected = true;
			
			this.uid = uid;	
			this.username  = username;
			this.room = room;
			this.uri   = uri;
			connectToServer(externUID, username);
		}
		
		private function connectToServer(externUID:String, username:String):void {			
			NetConnection.defaultObjectEncoding = flash.net.ObjectEncoding.AMF0;	
			netConnection = new NetConnection();
			netConnection.proxyType = "best";
			netConnection.client = this;
			netConnection.addEventListener( NetStatusEvent.NET_STATUS , netStatus );
			netConnection.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
			netConnection.connect(uri, externUID, username);
		}

		public function disconnect():void {
			netConnection.close();
		}
		
		private function netStatus (evt:NetStatusEvent ):void {		 
			var event:ConnectionStatusEvent = new ConnectionStatusEvent();
			
			switch(evt.info.code) {				
				case "NetConnection.Connect.Success":
					LogUtil.debug("Successfully connected to SIP application.");
					event.status = ConnectionStatusEvent.SUCCESS;								
					break;
		
				case "NetConnection.Connect.Failed":
					LogUtil.debug("Failed to connect to SIP application.");
					event.status = ConnectionStatusEvent.FAILED;
					break;
					
				case "NetConnection.Connect.Closed":
					LogUtil.debug("Connection to SIP application has closed.");
					event.status = ConnectionStatusEvent.CLOSED;
				break;
		
				case "NetConnection.Connect.Rejected":
					LogUtil.debug("Connection to SIP application was rejected.");
					event.status = ConnectionStatusEvent.REJECTED;
					break;					
				default:					
			}			
			
			LogUtil.debug("Phone Module Connection Status: " + event.status);
			LogUtil.debug("Dispatching " + event.status);
			dispatcher.dispatchEvent(event); 
		} 
		
		private function asyncErrorHandler(event:AsyncErrorEvent):void {
           LogUtil.debug("AsyncErrorEvent: " + event);
        }
		
		private function securityErrorHandler(event:SecurityErrorEvent):void {
            LogUtil.debug("securityErrorHandler: " + event);
        }
        
     	public function call():void {
     		LogUtil.debug("Calling " + room);
			doCall(room);
     	}
        
        //********************************************************************************************
		//			
		//			CallBack Methods from Red5 
		//
		//********************************************************************************************		
		public function failedToJoinVoiceConferenceCallback(msg:String):* {
			LogUtil.debug("failedToJoinVoiceConferenceCallback " + msg);
			var event:CallDisconnectedEvent = new CallDisconnectedEvent();
			dispatcher.dispatchEvent(event);	
			isConnected = false;
		}
		
		public function disconnectedFromJoinVoiceConferenceCallback(msg:String):* {
			LogUtil.debug("disconnectedFromJoinVoiceConferenceCallback " + msg);
			var event:CallDisconnectedEvent = new CallDisconnectedEvent();
			dispatcher.dispatchEvent(event);	
			isConnected = false;
		}	
				
        public function successfullyJoinedVoiceConferenceCallback(publishName:String, playName:String, codec:String):* {
        	LogUtil.debug("successfullyJoinedVoiceConferenceCallback " + publishName + " : " + playName + " : " + codec);
			isConnected = true;
			var event:CallConnectedEvent = new CallConnectedEvent();
			event.publishStreamName = publishName;
			event.playStreamName = playName;
			event.codec = codec;
			dispatcher.dispatchEvent(event);
		}
						
		//********************************************************************************************
		//			
		//			SIP Actions
		//
		//********************************************************************************************		
		public function doCall(dialStr:String):void {
			LogUtil.debug("Calling " + dialStr);
			netConnection.call("voiceconf.call", null, "default", username, dialStr);
		}
				
		public function doHangUp():void {			
			if (isConnected) {
				netConnection.call("voiceconf.hangup", null, "default");
				isConnected = false;
			}
		}
	}
}

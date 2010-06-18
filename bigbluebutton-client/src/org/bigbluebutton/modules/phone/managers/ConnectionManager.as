/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.modules.phone.managers {
	
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.AsyncErrorEvent;
	import flash.events.Event;
	import flash.events.IEventDispatcher;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.external.*;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	
	import org.bigbluebutton.core.events.ConnectionStatusEvent;
	import org.bigbluebutton.modules.phone.events.CallConnectedEvent;
	import org.bigbluebutton.modules.phone.events.CallDisconnectedEvent;
	import org.bigbluebutton.modules.phone.events.RegistrationFailedEvent;
	import org.bigbluebutton.modules.phone.events.RegistrationSuccessEvent;
	
	public class ConnectionManager {
			
		private  var netConnection:NetConnection = null;
		private var incomingNetStream:NetStream = null;
		private var outgoingNetStream:NetStream = null;
		private var username:String;
		private var uri:String;
		private var uid:String;
		private var room:String;
		
		private var isConnected:Boolean = false;
		private var registered:Boolean = false;

		private var localDispatcher:IEventDispatcher;
		
		public function ConnectionManager(dispatcher:IEventDispatcher):void {
			localDispatcher = dispatcher;
		}
		
		public function getConnection():NetConnection {
			return netConnection;
		}
		
		public function connect(uid:String, username:String, room:String, uri:String):void {
			this.uid = uid;	
			this.username  = username;
			this.room = room;
			this.uri   = uri;
			connectToServer();
		}
		
		private function connectToServer():void {			
			NetConnection.defaultObjectEncoding = flash.net.ObjectEncoding.AMF0;	
			netConnection = new NetConnection();
			netConnection.client = this;
			netConnection.addEventListener( NetStatusEvent.NET_STATUS , netStatus );
			netConnection.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
			netConnection.connect(uri);
		}

		public function disconnect():void {
			netConnection.close();
		}
		
		private function netStatus (evt:NetStatusEvent ):void {		 
			var event:ConnectionStatusEvent = new ConnectionStatusEvent();
			
			switch(evt.info.code) {				
				case "NetConnection.Connect.Success":
					trace("Successfully connected to SIP application.");
					event.status = ConnectionStatusEvent.SUCCESS;								
					break;
		
				case "NetConnection.Connect.Failed":
					trace("Failed to connect to SIP application.");
					event.status = ConnectionStatusEvent.FAILED;
					break;
					
				case "NetConnection.Connect.Closed":
					trace("Connection to SIP application has closed.");
					event.status = ConnectionStatusEvent.CLOSED;
				break;
		
				case "NetConnection.Connect.Rejected":
					trace("Connection to SIP application was rejected.");
					event.status = ConnectionStatusEvent.REJECTED;
					break;					
				default:					
			}			
			
			trace("Dispatching " + event.status);
			localDispatcher.dispatchEvent(event); 
		} 
		
		private function asyncErrorHandler(event:AsyncErrorEvent):void {
           trace("AsyncErrorEvent: " + event);
        }
		
		private function securityErrorHandler(event:SecurityErrorEvent):void {
            trace("securityErrorHandler: " + event);
        }
        
     	public function call():void {
     		trace("Calling " + room);
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
			localDispatcher.dispatchEvent(event);				
		}
		
		public function disconnectedFromJoinVoiceConferenceCallback(msg:String):* {
			LogUtil.debug("disconnectedFromJoinVoiceConferenceCallback " + msg);
			var event:CallDisconnectedEvent = new CallDisconnectedEvent();
			localDispatcher.dispatchEvent(event);				
		}	
				
        public function successfullyJoinedVoiceConferenceCallback(publishName:String, playName:String):* {
        	LogUtil.debug("Call has been connected");
			isConnected = true;
			var event:CallConnectedEvent = new CallConnectedEvent();
			event.publishStreamName = publishName;
			event.playStreamName = playName;
			localDispatcher.dispatchEvent(event);
		}
						
		//********************************************************************************************
		//			
		//			SIP Actions
		//
		//********************************************************************************************		
		public function doCall(dialStr:String):void {
			LogUtil.debug("Calling " + dialStr);
			netConnection.call("call", null, uid, dialStr);
		}
				
		public function doHangUp():void {			
			if (isConnected) {
				netConnection.call("hangup", null, uid);
				isConnected = false;
			}
		}
	}
}
/*
	This file is part of BBB-Notes.
	
	Copyright (c) Islam El-Ashi. All rights reserved.
	
	BBB-Notes is free software: you can redistribute it and/or modify
	it under the terms of the Lesser GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or 
	any later version.
	
	BBB-Notes is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	Lesser GNU General Public License for more details.
	
	You should have received a copy of the Lesser GNU General Public License
	along with BBB-Notes.  If not, see <http://www.gnu.org/licenses/>.
	
	Author: Islam El-Ashi <ielashi@gmail.com>, <http://www.ielashi.com>
*/
package org.bigbluebutton.modules.sharednotes.infrastructure
{
	import com.adobe.serialization.json.JSON;
	
	import flash.events.Event;
	import flash.events.IEventDispatcher;
	import flash.events.TimerEvent;
	import flash.utils.Timer;

	public class ServerConnection
	{
		public static const SYNCING_EVENT : String = "SN_SYNCING_EVENT";
		public static const SYNCED_EVENT : String = "SN_SYNCED_EVENT";
		
		private var client:Client;
		protected var dispatcher:IEventDispatcher;
		
		private var _pendingResponse:Boolean = false;		// flag indicating if a response has been received from the server
		private var connectionTimeout:Timer = new Timer(5000); //TODO: change the timeout
		
		public static var connectionType:String = ""; // determines the type of server connection (whether socket or http)
		
		public function ServerConnection(client:Client, dispatcher:IEventDispatcher) {
			this.client = client;
			this.dispatcher = dispatcher;
			connectionTimeout.addEventListener(TimerEvent.TIMER, function(e:Event):void { 
				connectionTimeout.stop(); 
				sendConnectRequest();
			});
		}
		
		protected function sendConnectRequest():void {
			var request:Object = new Object();
			request.documentName = Client.documentName;
			request.connectionType = ServerConnection.connectionType;
			//send("c, " + JSON.encode(request));
			connectionTimeout.start();
		}
		
		public function send(message:String):void { } // to be overridden
		
		protected function receive(data:String):void { 
			if (data.indexOf("c,") == 0) {
				trace("Received connection data: " + data);
				//var clientData:Object = JSON.decode(data.substring(2));
				//client.initClient(clientData.id, this, clientData.initialDocument);
				connectionTimeout.stop();
				pendingResponse = false;
			}
			else if (data.indexOf("m,") == 0) {
				//var message:Message = Message.deserialize(JSON.decode(data.substring(2)));
				//client.receiveMessage(message);
			}
			else {
				trace("unrecognized data: " + data);
			}
		}
		
		public function get pendingResponse():Boolean { 
			return _pendingResponse; 
		}
		
		public function set pendingResponse(value : Boolean):void {
			_pendingResponse = value;
			
			if (_pendingResponse) {
				dispatcher.dispatchEvent(new Event(SYNCING_EVENT));
			} else {
				dispatcher.dispatchEvent(new Event(SYNCED_EVENT));
			}
		}
		
		public function shutdown():void {
			connectionTimeout.stop();
		}
	}
}
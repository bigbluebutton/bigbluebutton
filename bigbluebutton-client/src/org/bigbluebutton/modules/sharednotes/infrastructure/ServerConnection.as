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
package org.bigbluebutton.modules.sharednotes.infrastructure
{
	import flash.events.Event;
	import flash.events.IEventDispatcher;
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;

	public class ServerConnection
	{
		private static const LOGGER:ILogger = getClassLogger(ServerConnection);      

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
				LOGGER.debug("Received connection data: {0}", [data]);
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
				LOGGER.debug("unrecognized data: {0}", [data]);
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
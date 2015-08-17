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
	import flash.events.DataEvent;
	import flash.events.Event;
	import flash.events.IEventDispatcher;
	import flash.events.TimerEvent;
	import flash.net.XMLSocket;
	import flash.utils.Timer;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	
	public class XMLServerConnection extends ServerConnection
	{
		public static var serverURL:String = "192.168.0.104";
		private static const LOGGER:ILogger = getClassLogger(XMLServerConnection);      

		public static const XML_CONNECTION_FAILED:String = "XML_CONNECTION_FAILED";
		private static const MAXIMUM_CONNECTION_ATTEMPTS:int = 5;
		
		private var _socket: XMLSocket;
		private var timeoutTimer: Timer = new Timer(5000);
		private var connectionAttempts:int = MAXIMUM_CONNECTION_ATTEMPTS;	// attempt to connect five times before dispatching a failure
		
		private function get socket():XMLSocket {
			return _socket;
		}
		
		public function XMLServerConnection(client:Client, dispatcher:IEventDispatcher)
		{
			super(client, dispatcher);
			ServerConnection.connectionType = "xmlsocket";
			
			timeoutTimer.addEventListener(TimerEvent.TIMER, function(e:Event):void { timeoutTimer.stop(); connect(); });
			connect();
		}
				
		public function connect():void {
			_socket = new XMLSocket();
			_socket.addEventListener(Event.CONNECT, function(e:Event):void { 
				connectionAttempts = MAXIMUM_CONNECTION_ATTEMPTS; 
				
				sendConnectRequest(); 
			});
			_socket.addEventListener(DataEvent.DATA, function(e:DataEvent):void { receive(e.data); });
			socket.connect(serverURL, 8095);
		}
		
		public override function send(message:String):void {
			try {
				pendingResponse = true;
				socket.send(message);
			} catch(e:Error) {
				//socket.close();
				if (connectionAttempts > 0) {
					LOGGER.debug(e.message);
					connectionAttempts--;
					timeoutTimer.start();
				} else {
					dispatcher.dispatchEvent(new Event(XML_CONNECTION_FAILED));
				}
			}
		}
	}
}
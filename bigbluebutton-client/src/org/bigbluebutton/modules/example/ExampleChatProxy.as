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
package org.bigbluebutton.modules.example
{
	import flash.events.NetStatusEvent;
	import flash.net.NetConnection;
	import flash.net.SharedObject;
	
	import mx.controls.Alert;

	public class ExampleChatProxy
	{
		private var url:String;
		private var conference:String;
		private var room:String;
		private var userid:Number;
		private var connection:NetConnection;
		
		private var simpleChatSO:SharedObject;
		
		private var window:ExampleChatWindow;
		
		public function ExampleChatProxy(window:ExampleChatWindow, attributes:Object)
		{
			this.window = window;
			
			extractAttributes(attributes);
			
			simpleChatSO = SharedObject.getRemote("simpleChatSO", url, false);
			simpleChatSO.addEventListener(NetStatusEvent.NET_STATUS, netStatusEventHandler);
			simpleChatSO.client = this;
			simpleChatSO.connect(connection);
		}
		
		private function extractAttributes(a:Object):void{
			conference = a.conference as String;
			room = a.room as String;
			userid = a.userid as Number;
			connection = a.connection;
			url = connection.uri;
		}
		
		private function netStatusEventHandler(event:NetStatusEvent):void{
			Alert.show(event.info.status);
		}
		
		public function sendMessage(message:String):void{
			simpleChatSO.send("serverCallback", message);
		}
		
		public function serverCallback(message:String):void{
			window.displayNewMessage(message);
		}
	}
}
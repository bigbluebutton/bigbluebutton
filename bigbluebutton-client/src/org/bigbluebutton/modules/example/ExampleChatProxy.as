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
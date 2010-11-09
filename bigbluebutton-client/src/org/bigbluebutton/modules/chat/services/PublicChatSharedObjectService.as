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
package org.bigbluebutton.modules.chat.services
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.AsyncErrorEvent;
	import flash.events.IEventDispatcher;
	import flash.events.NetStatusEvent;
	import flash.events.SyncEvent;
	import flash.net.NetConnection;
	import flash.net.Responder;
	import flash.net.SharedObject;
	
	import mx.controls.Alert;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.modules.chat.events.ConnectionEvent;
	import org.bigbluebutton.modules.chat.events.PublicChatMessageEvent;
	import org.bigbluebutton.modules.chat.events.TranscriptEvent;

	public class PublicChatSharedObjectService
	{
		public static const NAME:String = "ChatSharedObjectService";
		
		private var chatSO:SharedObject;
		private var connection:NetConnection;
		private var dispatcher:Dispatcher;
		
		public function PublicChatSharedObjectService(connection:NetConnection)
		{			
			this.connection = connection;
			this.dispatcher = new Dispatcher();		
		}
						
	    public function join(uri:String):void
		{
			chatSO = SharedObject.getRemote("chatSO", uri, false);
			chatSO.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
			chatSO.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
			chatSO.addEventListener(SyncEvent.SYNC, sharedObjectSyncHandler);	
			chatSO.client = this;
			chatSO.connect(connection);					
		}
		
	    public function leave():void
	    {
	    	if (chatSO != null) {
	    		chatSO.close();
	    	}
	    }

		private function netStatusHandler(event:NetStatusEvent):void
		{
			var statusCode:String = event.info.code;
			var connEvent:ConnectionEvent = new ConnectionEvent(ConnectionEvent.CONNECT_EVENT);
			
			switch ( statusCode ) 
			{
				case "NetConnection.Connect.Success":				
					connEvent.success = true;					
					break;
				default:
					connEvent.success = false;
				   break;
			}
			dispatcher.dispatchEvent(connEvent);
		}
		
		public function sendMessage(message:String):void
		{
			var nc:NetConnection = connection;
			nc.call(
				"chat.sendMessage",// Remote function name
				new Responder(
	        		// On successful result
					function(result:Object):void { 
						LogUtil.debug("Successfully sent message: "); 
					},	
					// status - On error occurred
					function(status:Object):void { 
						LogUtil.error("Error occurred:"); 
						for (var x:Object in status) { 
							LogUtil.error(x + " : " + status[x]); 
						} 
					}
				),//new Responder
				message
			); //_netConnection.call
		}
		
		/**
		 * Called by the server to deliver a new chat message.
		 */	
		public function newChatMessage(message:String):void{
			var event:PublicChatMessageEvent = new PublicChatMessageEvent(PublicChatMessageEvent.PUBLIC_CHAT_MESSAGE_EVENT);
			event.message = message;
			
			var globalDispatcher:Dispatcher = new Dispatcher();
			globalDispatcher.dispatchEvent(event);	   			
		}

		private function sendTranscriptLoadedEvent():void {
			LogUtil.debug("Sending transcript loaded Event");
			var event:TranscriptEvent = new TranscriptEvent(TranscriptEvent.TRANSCRIPT_EVENT);
			var globalDispatcher:Dispatcher = new Dispatcher();
			globalDispatcher.dispatchEvent(event);	
		}
		
		public function getChatTranscript():void {
			var nc:NetConnection = connection;
			nc.call(
				"chat.getChatMessages",// Remote function name
				new Responder(
	        		// On successful result
					function(result:Object):void { 
						LogUtil.debug("Successfully sent message: "); 
						if (result != null) {
							receivedChatHistory(result);
						}
					},	
					// status - On error occurred
					function(status:Object):void { 
						LogUtil.error("Error occurred:"); 
						for (var x:Object in status) { 
							LogUtil.error(x + " : " + status[x]); 
						} 
					}
				)//new Responder
			); //_netConnection.call				
		}
		
		private function receivedChatHistory(result:Object):void{
			if (result == null) return;
			
			var messages:Array = result as Array;
			for (var i:int = 0; i < messages.length; i++){
				newChatMessage(messages[i] as String);
			}
			
			sendTranscriptLoadedEvent();
		}
		
		private function asyncErrorHandler(event:AsyncErrorEvent):void
		{
			trace("PresentSO asynchronous error.");
		}
		
		private function sharedObjectSyncHandler(event:SyncEvent) : void
		{
			var connEvent:ConnectionEvent = new ConnectionEvent(ConnectionEvent.CONNECT_EVENT);	
			connEvent.success = true;		
			trace("Dispatching NET CONNECTION SUCCESS");
			dispatcher.dispatchEvent(connEvent);
		}
	}
}
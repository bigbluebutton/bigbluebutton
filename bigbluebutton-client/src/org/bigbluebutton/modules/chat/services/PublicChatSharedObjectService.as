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
	
	import org.bigbluebutton.modules.chat.events.ConnectionEvent;
	import org.bigbluebutton.modules.chat.events.PublicChatMessageEvent;
	import org.bigbluebutton.modules.chat.events.TranscriptLoadedEvent;

	public class PublicChatSharedObjectService
	{
		public static const NAME:String = "ChatSharedObjectService";
		
		private var chatSO:SharedObject;
		private var connection:NetConnection;
		private var dispatcher:IEventDispatcher;
		
		public function PublicChatSharedObjectService(connection:NetConnection, dispatcher:IEventDispatcher)
		{			
			this.connection = connection;
			this.dispatcher = dispatcher;		
		}
						
	    public function join(uri:String):void
		{
			chatSO = SharedObject.getRemote("chatSO", uri, false);
			chatSO.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
			chatSO.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
			chatSO.addEventListener(SyncEvent.SYNC, sharedObjectSyncHandler);	
			chatSO.client = this;
			if (connection == null) trace("Joininh ChatSharedObject");
			trace("Chat connection = " + connection.uri);
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
					trace("Connection success");		
					connEvent.success = true;					
					break;
				default:
					trace("Connection failed");
					connEvent.success = false;
				   break;
			}
			trace("Dispatching NET CONNECTION SUCCESS");
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
			trace("Received New Chat Message " + message);	
			var event:PublicChatMessageEvent = new PublicChatMessageEvent(PublicChatMessageEvent.PUBLIC_CHAT_MESSAGE_EVENT);
			event.message = message;
			
			var globalDispatcher:Dispatcher = new Dispatcher();
			globalDispatcher.dispatchEvent(event);	   
		}

		private function sendTranscriptLoadedEvent():void {
			LogUtil.debug("Sending transcript loaded Event");
			var event:TranscriptLoadedEvent = new TranscriptLoadedEvent(TranscriptLoadedEvent.TRANSCRIPT_EVENT);
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
							newChatMessage(result as String);
						}	
						sendTranscriptLoadedEvent();
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
			
			getChatTranscript();
		}
	}
}
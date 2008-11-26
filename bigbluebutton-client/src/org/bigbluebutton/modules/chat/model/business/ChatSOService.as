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
package org.bigbluebutton.modules.chat.model.business
{
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SyncEvent;
	import flash.net.SharedObject;

	public class ChatSOService implements IChatService
	{
		public static const NAME:String = "ChatSOService";
		
		private static const TRANSCRIPT:String = "TRANSCRIPT";
		private var chatSO : SharedObject;
		private var netConnectionDelegate: NetConnectionDelegate;
		private var _uri:String;
		private var _msgListener:Function;
		private var _connectionListener:Function;
		private var _soErrors:Array;
		
		private var needsTranscript:Boolean = false;
		
		public function ChatSOService(uri:String)
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
		
		private function connectionListener(connected:Boolean, errors:Array=null):void {
			if (connected) {
				trace(NAME + ":Connected to the Chat application");
				join();
				notifyConnectionStatusListener(true);
			} else {
				leave();
				trace(NAME + ":Disconnected from the Chat application");
				notifyConnectionStatusListener(false, errors);
			}
		}
		
	    private function join() : void
		{
			chatSO = SharedObject.getRemote("chatSO", _uri, false);
			chatSO.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
			chatSO.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
			chatSO.addEventListener(SyncEvent.SYNC, sharedObjectSyncHandler);
			chatSO.client = this;
			chatSO.connect(netConnectionDelegate.connection);
			trace(NAME + ":Chat is connected to Shared object");
						
		}
		
	    private function leave():void
	    {
	    	if (chatSO != null) chatSO.close();
	    }

		public function addMessageListener(messageListener:Function):void {
			_msgListener = messageListener;
		}
		
		public function addConnectionStatusListener(connectionListener:Function):void {
			_connectionListener = connectionListener;
		}
		
		public function sendMessage(message:String):void
		{
			var trans:String = chatSO.data[TRANSCRIPT];
			if (trans != null) {
				trans += '<br/>' + message;
			} else {
				trans = message;
			}
			chatSO.setProperty(TRANSCRIPT, trans);
			chatSO.setDirty(TRANSCRIPT);
			chatSO.send("receiveNewMessage", message);
		}
			
		public function receiveNewMessage(message:String):void{
			if (_msgListener != null) {
				_msgListener( message);
			}		   
		}

		public function getChatTranscript():void {
			trace('getting chat transcript');
			needsTranscript = true;				
		}
		
		private function notifyConnectionStatusListener(connected:Boolean, errors:Array=null):void {
			if (_connectionListener != null) {
				trace('notifying connectionListener for CHat');
				_connectionListener(connected, errors);
			} else {
				trace("_connectionListener is null");
			}
		}

		private function sharedObjectSyncHandler(event:SyncEvent):void
		{
			if (event.changeList.length == 1) {
				if (needsTranscript) {
						needsTranscript = false;
				}
			} else {
				for (var i : uint = 0; i < event.changeList.length; i++) 
				{
					if (event.changeList[i].name == TRANSCRIPT) {
						if (needsTranscript) {
							needsTranscript = false;
							receiveNewMessage( chatSO.data[TRANSCRIPT] );				
						}
					} 	
				}
			}
		}
		
		private function netStatusHandler (event:NetStatusEvent):void
		{
			var statusCode:String = event.info.code;
			
			switch ( statusCode ) 
			{
				case "NetConnection.Connect.Success":
					trace(NAME + ":Connection Success");		
					//notifyConnectionStatusListener(true);			
					break;
			
				case "NetConnection.Connect.Failed":
					addError("ChatSO connection failed");			
					break;
					
				case "NetConnection.Connect.Closed":
					addError("Connection to ChatSO was closed.");									
					notifyConnectionStatusListener(false, _soErrors);
					break;
					
				case "NetConnection.Connect.InvalidApp":
					addError("ChatSO not found in server");				
					break;
					
				case "NetConnection.Connect.AppShutDown":
					addError("ChatSO is shutting down");
					break;
					
				case "NetConnection.Connect.Rejected":
					addError("No permissions to connect to the chat SO");
					break;
					
				default :
					//addError("ChatSO " + event.info.code);
				   trace(NAME + ":default - " + event.info.code );
				   break;
			}
		}
			
		private function asyncErrorHandler (event:AsyncErrorEvent):void
		{
			addError("ChatSO asynchronous error.");
		}
		
		private function addError(error:String):void {
			if (_soErrors == null) {
				_soErrors = new Array();
			}
			_soErrors.push(error);
		}
	}
}
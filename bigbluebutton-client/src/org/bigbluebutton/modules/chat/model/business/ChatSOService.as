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
	import flash.net.NetConnection;
	import flash.net.Responder;
	import flash.net.SharedObject;

	public class ChatSOService implements IChatService
	{
		public static const NAME:String = "ChatSOService";
		
		private static const TRANSCRIPT:String = "TRANSCRIPT";
		private var chatSO : SharedObject;
		private var netConnectionDelegate: NetConnectionDelegate;
		private var module:ChatModule;
		private var _msgListener:Function;
		private var _connectionListener:Function;
		private var _soErrors:Array;
		
		private var needsTranscript:Boolean = false;
		
		public function ChatSOService(module:ChatModule)
		{			
			this.module = module;		
		}
				
		private function connectionListener(connected:Boolean, errors:Array=null):void {
			if (connected) {
				LogUtil.debug(NAME + ":Connected to the Chat application");
				join();
				notifyConnectionStatusListener(true);
			} else {
				leave();
				LogUtil.debug(NAME + ":Disconnected from the Chat application");
				notifyConnectionStatusListener(false, errors);
			}
		}
		
	    public function join() : void
		{
			chatSO = SharedObject.getRemote("chatSO", module.uri, false);
			chatSO.client = this;
			chatSO.connect(module.connection);
			LogUtil.debug(NAME + ":Chat is connected to Shared object");
			notifyConnectionStatusListener(true);
			if (module.mode == 'LIVE') {
				getChatTranscript();
			}						
		}
		
	    public function leave():void
	    {
	    	if (chatSO != null) chatSO.close();
	    	notifyConnectionStatusListener(false);
	    }

		public function addMessageListener(messageListener:Function):void {
			_msgListener = messageListener;
		}
		
		public function addConnectionStatusListener(connectionListener:Function):void {
			_connectionListener = connectionListener;
		}
		
		public function sendMessage(message:String):void
		{
			var nc:NetConnection = module.connection;
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
			if (_msgListener != null) {
				_msgListener( message);
			}		   
		}

		public function getChatTranscript():void {
			var nc:NetConnection = module.connection;
			nc.call(
				"chat.getChatMessages",// Remote function name
				new Responder(
	        		// On successful result
					function(result:Object):void { 
						LogUtil.debug("Successfully sent message: "); 
						if (result != null) {
							newChatMessage(result as String);
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
		
		private function notifyConnectionStatusListener(connected:Boolean, errors:Array=null):void {
			if (_connectionListener != null) {
				LogUtil.debug('notifying connectionListener for CHat');
				_connectionListener(connected, errors);
			} else {
				LogUtil.debug("_connectionListener is null");
			}
		}
		
		private function addError(error:String):void {
			if (_soErrors == null) {
				_soErrors = new Array();
			}
			_soErrors.push(error);
		}
	}
}
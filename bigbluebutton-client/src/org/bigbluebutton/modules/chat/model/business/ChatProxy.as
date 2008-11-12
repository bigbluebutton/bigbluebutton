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
	import org.bigbluebutton.modules.chat.ChatModuleConstants;
	import org.bigbluebutton.modules.chat.model.vo.*;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
		
	public class ChatProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "ChatProxy";
		
		private var uri:String;		
		private var chatService:IChatService;

		public function ChatProxy(uri:String)
		{
			super(NAME);
			chatService = new ChatSOService(uri);
			chatService.connect(uri);
			chatService.addMessageListener(newMessageHandler);
			chatService.addConnectionStatusListener(connectionStatusListener);
		}
		
		public function stop():void {
			chatService.disconnect();
		}
		
		private function connectionStatusListener(connected:Boolean):void {
			if (connected) {
				trace('Sending ChatModuleConstants.CONNECTED');
				sendNotification(ChatModuleConstants.CONNECTED);
			} else {
				trace('Sending ChatModuleConstants.DISCONNECTED');
				sendNotification(ChatModuleConstants.DISCONNECTED);
			}
		}
		
		private function newMessageHandler(message:String):void {
			sendNotification(ChatModuleConstants.NEW_MESSAGE, message);
		}
		
		public function sendMessage(message:String):void
		{
			chatService.sendMessage(message);
		}
		
		public function getChatTranscript():void {
			chatService.getChatTranscript();
		}
	}
}
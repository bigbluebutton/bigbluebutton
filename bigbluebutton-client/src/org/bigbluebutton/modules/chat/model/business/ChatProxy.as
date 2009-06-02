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
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
		
	public class ChatProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "ChatProxy";
		
		private var module:ChatModule;		
		private var chatService:IChatService;
		
		// Is teh disconnection due to user issuing the disconnect or is it the server
		// disconnecting due to t fault?
		private var manualDisconnect:Boolean = false;
		
		public function ChatProxy(module:ChatModule)
		{
			super(NAME);
			this.module = module;
			start();
		}
		
		public function start():void {
			chatService = new ChatSOService(module);
			manualDisconnect = false;
			chatService.addMessageListener(newMessageHandler);
//			chatService.addConnectionStatusListener(connectionStatusListener);
			chatService.join();
		}
		
		public function stop():void {
			// USer is issuing a disconnect.
			manualDisconnect = true;
			chatService.leave();
		}
		
		private function connectionStatusListener(connected:Boolean, errors:Array):void {
			if (connected) {
				LogUtil.debug('Sending ChatModuleConstants.CONNECTED');
				sendNotification(ChatModuleConstants.CONNECTED);
			} else {
				LogUtil.debug('Sending ChatModuleConstants.DISCONNECTED');
				sendNotification(ChatModuleConstants.DISCONNECTED, {manual:manualDisconnect, errors:errors});
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
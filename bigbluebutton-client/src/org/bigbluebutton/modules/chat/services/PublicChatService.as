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
	import flash.events.IEventDispatcher;
	
	import org.bigbluebutton.modules.chat.events.SendPublicChatMessageEvent;
	
	public class PublicChatService
	{
		private var attributes:Object;
		
		private var chatSOService:PublicChatSharedObjectService;
		

		public function setModuleAttributes(attributes:Object):void {
			this.attributes = attributes;
		}
		
		public function join():void {
			chatSOService = new PublicChatSharedObjectService(attributes.connection);
			chatSOService.join(attributes.uri + "/" + attributes.room);
		}
		
		public function leave():void {
			chatSOService.leave();
		}
		
		public function loadTranscript():void{
			chatSOService.getChatTranscript();
		}
		
			public function sendChatMessageEvent(event:SendPublicChatMessageEvent):void {
			trace("Receive receivedSendPublicChatMessageEvent");
			var newMessage:String;
			newMessage =  event.message;
			if(event.reverse){
				var arStr:Array = event.message.split(" ");
				for (var i:int = ( arStr.length - 1 ); i > -1; i--) 
				{
					newMessage+=" "+arStr[i];
				}
			}
			chatSOService.sendMessage(newMessage,attributes.username,event.color,event.time,event.language,attributes.userid);
		}
	}
}
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
	
	import org.bigbluebutton.main.views.LanguageSelector;
	import org.bigbluebutton.modules.chat.events.SendPrivateChatMessageEvent;
	import org.bigbluebutton.modules.chat.model.ChatObject;
	import org.bigbluebutton.modules.chat.model.MessageVO;
	

	public class PrivateChatService
	{
		/** This property is injected by the application. */
		public var dispatcher:IEventDispatcher;
		
		private var attributes:Object;

		private var chatSOService:PrivateChatSharedObjectService;
		

		public function setModuleAttributes(attributes:Object):void {
			this.attributes = attributes;
		}
		
		public function join():void {
			chatSOService = new PrivateChatSharedObjectService(attributes.connection, dispatcher);
			chatSOService.join(attributes.userid, attributes.uri + "/" + attributes.room);
		}
		
		public function leave():void {
			chatSOService.leave();
		}
		
		public function sendChatMessageEvent(event:SendPrivateChatMessageEvent):void {
			trace("Receive receivedSendPrivateChatMessageEvent");

			var chatobj:ChatObject = new ChatObject();
			chatobj.message = event.message;
			chatobj.username = attributes.username;
			chatobj.color = event.color;
			chatobj.time = event.time;
			chatobj.language = event.language;
			chatobj.userid = attributes.userid;
			
			var newMessage:String  = event.message;
			if(event.reverse){
				var arStr:Array = event.message.split(" ");
				newMessage = "";
				for (var i:int = ( arStr.length - 1 ); i > -1; i--) 
				{
					newMessage+=" "+arStr[i];
				}
			}
			
			chatobj.message = newMessage;
			var messageVO:MessageVO = new MessageVO(chatobj, attributes.userid, event.toUser);
			
			chatSOService.sendMessage(messageVO);
		}
		
		public function queryForParticipants():void {
			chatSOService.queryForParticipants();
		}
	}
}
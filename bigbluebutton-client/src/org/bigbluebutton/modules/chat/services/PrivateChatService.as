package org.bigbluebutton.modules.chat.services
{
	import flash.events.IEventDispatcher;
	
	import org.bigbluebutton.modules.chat.events.SendPrivateChatMessageEvent;
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
			var newMessage:String;			
			newMessage = "<font color=\"#" + event.color + "\"><b>[" + 
						attributes.username +" - "+ event.time + "]</b> " + event.message + "</font><br/>";
			var messageVO:MessageVO = new MessageVO(newMessage, attributes.userid, event.toUser);
			chatSOService.sendMessage(messageVO);
		}
		
		public function queryForParticipants():void {
			chatSOService.queryForParticipants();
		}
	}
}
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
			/*newMessage = "<font color=\"#" + event.color + "\"><b>[" + 
						attributes.username +" - "+ event.time + "]</b> " + event.message + "</font><br/>";			*/
			newMessage = event.message + "|" + attributes.username + "|" + event.color + "|" + event.time + "|" + event.language;
			chatSOService.sendMessage(newMessage);
		}
	}
}
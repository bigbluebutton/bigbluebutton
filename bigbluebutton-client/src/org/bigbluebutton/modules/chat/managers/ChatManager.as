package org.bigbluebutton.modules.chat.managers
{
	import flash.events.IEventDispatcher;
	
	public class ChatManager
	{
		/** This property is injected by the application. */
		public var dispatcher:IEventDispatcher;
		
		private var attributes:Object;
		
		public function ChatManager()
		{
		}

		public function setModuleAttributes(attributes:Object):void {
			this.attributes = attributes;
		}
		
		public function getDispatcher():IEventDispatcher {
			return dispatcher;
		}
		
		public function receivedMessage():void {
			trace("Got New Public Chat message");
		}
		
		public function receivedPrivateMessage():void {
			trace("Got New Private Chat message");
		}
		
		public function receivedGlobalMessage():void {
			trace("Got New Global Chat message");
		}
		
		public function receivedSendPublicChatMessageEvent():void {
			trace("Receive receivedSendPublicChatMessageEvent");
		}
	}
}
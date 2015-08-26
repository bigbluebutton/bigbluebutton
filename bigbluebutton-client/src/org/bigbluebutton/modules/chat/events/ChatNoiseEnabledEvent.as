package org.bigbluebutton.modules.chat.events {
	import flash.events.Event;
	
	public class ChatNoiseEnabledEvent extends Event {
		public static const CHAT_NOISE_CHANGE_EVENT:String = "chat noise change event";
		
		public var enabled:Boolean = false;
		
		public function ChatNoiseEnabledEvent(enabled:Boolean) {
			super(CHAT_NOISE_CHANGE_EVENT, true);
			
			this.enabled = enabled;
		}
	}
}
package org.bigbluebutton.modules.chat.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.chat.model.MessageVO;

	public class PrivateChatMessageEvent extends Event
	{
		
		public static const PRIVATE_CHAT_MESSAGE_EVENT:String = 'PRIVATE_CHAT_MESSAGE_EVENT';
		
		public var message:MessageVO;
		
		public function PrivateChatMessageEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}
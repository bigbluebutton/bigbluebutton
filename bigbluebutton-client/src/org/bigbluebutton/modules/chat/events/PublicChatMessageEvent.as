package org.bigbluebutton.modules.chat.events
{
	import flash.events.Event;

	public class PublicChatMessageEvent extends Event
	{
		public static const PUBLIC_CHAT_MESSAGE_EVENT:String = 'PUBLIC_CHAT_MESSAGE_EVENT';
		public var message:String;
		
		public function PublicChatMessageEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}
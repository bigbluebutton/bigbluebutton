package org.bigbluebutton.chat.events
{
	import flash.events.Event;
	
	public class ChatMessageEvent extends Event
	{
		public static const CHAT_MESSAGE_EVENT:String = 'CHAT_MESSAGE_EVENT';
		
		public var message:String;
		public var user:String;
		public var color:String;
		public var timestamp:String;
		
		
		public function ChatMessageEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}
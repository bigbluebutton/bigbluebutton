package org.bigbluebutton.modules.chat.events
{
	import flash.events.Event;

	public class SendPrivateChatMessageEvent extends Event
	{
		public static const SEND_PRIVATE_CHAT_MESSAGE_EVENT:String = 'SEND_PRIVATE_CHAT_MESSAGE_EVENT';
		public var message:String;
		public var toUser:String;
		public var time:String;
		public var color:String;
				
		public function SendPrivateChatMessageEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}
package org.bigbluebutton.modules.chat.events
{
	import flash.events.Event;

	public class ChatCopyEvent extends Event
	{
		public static const COPY_CHAT_EVENT:String = 'COPY_CHAT_EVENT';

		public var chatId:String;

		public function ChatCopyEvent(type:String)
		{
			super(type, true, false);
		}
	}
}

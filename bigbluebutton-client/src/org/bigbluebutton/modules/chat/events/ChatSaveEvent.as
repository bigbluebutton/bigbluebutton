package org.bigbluebutton.modules.chat.events
{
	import flash.events.Event;

	public class ChatSaveEvent extends Event
	{
		public static const SAVE_CHAT_EVENT:String = 'SAVE_CHAT_EVENT';

		public var chatId: String;
		public var filename:String;

		public function ChatSaveEvent(type:String)
		{
			super(type, true, false);
		}
	}
}

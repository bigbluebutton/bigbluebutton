package org.bigbluebutton.modules.chat.events
{
	import flash.events.Event;
	import org.bigbluebutton.modules.chat.model.ChatConversation;

	public class ChatSaveEvent extends Event
	{
		public static const SAVE_CHAT_EVENT:String = 'SAVE_CHAT_EVENT';

		public var chatMessages:ChatConversation;
		public var filename:String;

		public function ChatSaveEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
	}
}

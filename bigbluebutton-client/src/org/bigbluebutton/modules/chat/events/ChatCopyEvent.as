package org.bigbluebutton.modules.chat.events
{
	import flash.events.Event;
	import org.bigbluebutton.modules.chat.model.ChatConversation;

	public class ChatCopyEvent extends Event
	{
		public static const COPY_CHAT_EVENT:String = 'COPY_CHAT_EVENT';

		public var chatMessages:ChatConversation;

		public function ChatCopyEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
	}
}

package org.bigbluebutton.modules.chat.events
{
	import flash.events.Event;

	public class ChatToolbarButtonEvent extends Event
	{
		public static const SAVE_CHAT_TOOLBAR_EVENT:String = "SAVE_CHAT_TOOLBAR_EVENT";
		public static const COPY_CHAT_TOOLBAR_EVENT:String = "COPY_CHAT_TOOLBAR_EVENT";
		public static const CLEAR_PUBLIC_CHAT_TOOLBAR_EVENT:String = "CLEAR_PUBLIC_CHAT_TOOLBAR_EVENT";

		public function ChatToolbarButtonEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
	}
}
package org.bigbluebutton.modules.chat.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.chat.views.ChatWindow;
	
	public class ChatToolbarButtonEvent extends Event
	{
		public static const ADD_TOOLBAR:String = "ADD_TOOLBAR";		
		
		public static const CHAT_TOOLBAR_BUTTON_PRESSED:String = "CHAT_TOOLBAR_BUTTON_PRESSED";
		public static const PRESSED_BUTTON_SAVE:String = "PRESSED_BUTTON_SAVE";
		public static const PRESSED_BUTTON_COPY_TEXT:String = "PRESSED_BUTTON_COPY_TEXT";
		public static const SAVE_CHAT_TOOLBAR_EVENT:String = "SAVE_CHAT_TOOLBAR_EVENT";
		public static const COPY_CHAT_TOOLBAR_EVENT:String = "COPY_CHAT_TOOLBAR_EVENT";

		public var window:ChatWindow;
		public var pressedButton:String;
		
		public function ChatToolbarButtonEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}

	}
}
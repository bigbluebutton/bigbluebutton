package org.bigbluebutton.modules.chat.events
{
	import flash.events.Event;

	public class ChatOptionsEvent extends Event
	{
		public static const CHANGE_FONT_SIZE:String = "Change Font Size";
		
		public var fontSize:int;
		
		public function ChatOptionsEvent(type:String)
		{
			super(type, true, false);
		}
	}
}
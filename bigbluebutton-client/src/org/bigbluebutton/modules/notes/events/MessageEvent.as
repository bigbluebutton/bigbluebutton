package org.bigbluebutton.modules.notes.events
{
	import flash.events.Event;
	
	public class MessageEvent extends Event
	{
		public static const NEW:String = "newMessageEvent";
		public var message:String;
		
		public function MessageEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false)
		{
			super(type, bubbles, cancelable);
		}

	}
}
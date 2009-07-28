package org.bigbluebutton.modules.chat.events
{
	import flash.events.Event;

	public class OpenChatBoxEvent extends Event
	{
		public function OpenChatBoxEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}
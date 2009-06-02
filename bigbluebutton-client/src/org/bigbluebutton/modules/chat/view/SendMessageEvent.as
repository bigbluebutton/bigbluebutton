package org.bigbluebutton.modules.chat.view
{
	import flash.events.Event;

	public class SendMessageEvent extends Event
	{
		public function SendMessageEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}
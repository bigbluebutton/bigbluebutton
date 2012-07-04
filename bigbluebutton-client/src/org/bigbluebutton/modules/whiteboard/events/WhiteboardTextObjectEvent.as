package org.bigbluebutton.modules.whiteboard.events
{
	import flash.events.Event;
	
	public class WhiteboardTextObjectEvent extends Event
	{
		public function WhiteboardTextObjectEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
	}
}
package org.bigbluebutton.modules.deskShare.events
{
	import flash.events.Event;

	public class StopModuleEvent extends Event
	{
		public static const STOP_MODULE_EVENT:String = "Stop Module Event";
		
		public function StopModuleEvent(bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(STOP_MODULE_EVENT, bubbles, cancelable);
		}
		
	}
}
package org.bigbluebutton.main.events
{
	import flash.events.Event;

	public class AppEvent extends Event
	{
		public static const APP_READY_EVENT:String = 'appReadyEvent';
		
		public function AppEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}
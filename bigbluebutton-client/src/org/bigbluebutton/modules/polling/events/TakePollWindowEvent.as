package org.bigbluebutton.modules.polling.events
{
	import flash.events.Event;
	
	public class TakePollWindowEvent extends Event
	{
		public static const CLOSE_WINDOW:String = "close take poll window event";
				
		public function TakePollWindowEvent()
		{
			super(CLOSE_WINDOW, true, false);
		}
	}
}
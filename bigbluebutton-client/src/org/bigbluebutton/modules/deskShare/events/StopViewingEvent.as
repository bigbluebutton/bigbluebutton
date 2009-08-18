package org.bigbluebutton.modules.deskShare.events
{
	import flash.events.Event;
	
	public class StopViewingEvent extends Event
	{
		public static const STOP_VIEWING:String = "StopViewing";
		
		public function StopViewingEvent(type:String = STOP_VIEWING)
		{
			super(type, true, false);
		}

	}
}
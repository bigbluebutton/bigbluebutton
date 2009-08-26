package org.bigbluebutton.core.events
{
	import flash.events.Event;
	
	public class RCSendEvent extends Event
	{
		public static const RC_SEND:String = "rc_event_sent";
		
		public function RCSendEvent(type:String = RC_SEND)
		{
			super(type, true, false);
		}

	}
}
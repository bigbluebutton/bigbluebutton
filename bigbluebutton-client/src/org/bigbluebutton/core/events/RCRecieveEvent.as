package org.bigbluebutton.core.events
{
	import flash.events.Event;
	
	public class RCRecieveEvent extends Event
	{
		public static const RC_RECIEVE:String = "rc_event_recieved";
		public var message:Object;
		
		public function RCRecieveEvent(type:String = RC_RECIEVE)
		{
			super(type, true, false);
		}

	}
}
package org.bigbluebutton.modules.videoconf.events
{
	import flash.events.Event;
	
	public class BroadcastStartedEvent extends Event
	{
		public static const BROADCAST_STARTED_EVENT:String = "BROADCAST_STARTED_EVENT";
		
		public var stream:String;
		public var userid:Number;
		
		public function BroadcastStartedEvent(type:String = BROADCAST_STARTED_EVENT)
		{
			super(type, true, false);
		}

	}
}
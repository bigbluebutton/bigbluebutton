package org.bigbluebutton.modules.videoconf.events
{
	import flash.events.Event;
	
	public class BroadcastStoppedEvent extends Event
	{
		public static const BROADCAST_STOPPED:String = "BROADCAST_STOPPED";
		
		public var stream:String;
		public var userid:Number;
		
		public function BroadcastStoppedEvent(type:String = BROADCAST_STOPPED)
		{
			super(type, true, false);
		}

	}
}
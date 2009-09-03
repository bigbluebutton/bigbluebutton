package org.bigbluebutton.modules.videoconf.events
{
	import flash.events.Event;
	
	public class StopBroadcastEvent extends Event
	{
		public static const STOP_BROADCASTING:String = "STOP_BROADCASTING";
		
		public var stream:String;
		
		public function StopBroadcastEvent(type:String = STOP_BROADCASTING)
		{
			super(type, true, false);
		}

	}
}
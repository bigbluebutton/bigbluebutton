package org.bigbluebutton.modules.videoconf.events
{
	import flash.events.Event;
	import flash.media.Camera;
	
	public class StartBroadcastEvent extends Event
	{
		public static const START_BROADCAST:String = "startBroadcastEvent";
		
		public var stream:String;
		public var camera:Camera;
		
		public function StartBroadcastEvent(type:String = START_BROADCAST)
		{
			super(type, true, false);
		}

	}
}
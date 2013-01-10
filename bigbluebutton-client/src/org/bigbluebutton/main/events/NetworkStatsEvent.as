package org.bigbluebutton.main.events
{
	import flash.events.Event;
	import flash.utils.Dictionary;	 

	public class NetworkStatsEvent extends Event
	{
		public static const NETWORK_STATS_EVENTS:String = "NETWORK_STATS_EVENTS";
		
		public var downloadStats:Dictionary;
		public var uploadStats:Dictionary;
		
		public function NetworkStatsEvent(bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(NETWORK_STATS_EVENTS, bubbles, cancelable);
		}
		
	}
}
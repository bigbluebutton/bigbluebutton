package org.bigbluebutton.playback.events
{
	import flash.events.Event;
	
	public class PlaybackEvent extends Event
	{
		public static const PLAYBACK_EVENT:String="getPlaybackEvent";
		
		public var attributes:Object;
		//public var playtype:String;// values: forward and reverse
		
		public function PlaybackEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
	}
}
package org.bbb.playback.events
{
	import flash.events.Event;
	
	
	public class PlaybackEvent extends Event
	{
		public static const CHAT_EVENT:String="getChatEvent";
		//for events not registered
		public static const HISTORY_EVENT:String="getHistoryEvent";
		
		public var attributes:Object;
		public var playtype:String;// values: forward and reverse
		public function PlaybackEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
	}
}
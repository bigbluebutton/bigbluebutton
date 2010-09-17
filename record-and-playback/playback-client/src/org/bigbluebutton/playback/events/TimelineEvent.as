package org.bigbluebutton.playback.events
{
	import flash.events.Event;
	
	import mx.collections.ArrayCollection;

	public class TimelineEvent extends Event
	{
		public static const TIMELINE_EVENT:String="getTimelineEvent";
		
		public var timeline:ArrayCollection;
		
		public function TimelineEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
	}
}
package org.bigbluebutton.modules.video.view.events
{
	import flash.events.Event;

	public class StartPlayStreamEvent extends Event
	{
		public static const START_PLAY_STREAM_EVENT:String = "START_PLAY_STREAM_EVENT";
		
		public var streamName:String;
		
		public function StartPlayStreamEvent(streamName:String)
		{
			super(START_PLAY_STREAM_EVENT);
			this.streamName = streamName;
		}
		
	}
}
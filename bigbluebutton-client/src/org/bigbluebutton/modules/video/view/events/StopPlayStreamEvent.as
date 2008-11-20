package org.bigbluebutton.modules.video.view.events
{
	import flash.events.Event;

	public class StopPlayStreamEvent extends Event
	{
		public static const STOP_PLAY_STREAM_EVENT:String = "STOP_PLAY_STREAM_EVENT";
		
		public var streamName:String;
		
		public function StopPlayStreamEvent(streamName:String)
		{
			super(STOP_PLAY_STREAM_EVENT);
			this.streamName = streamName;
		}
		
	}
}
package org.bigbluebutton.modules.phone.events
{
	import flash.events.Event;

	public class PlayStreamStatusEvent extends Event
	{
		public static const STREAM_NOT_FOUND:String = 'STREAM_NOT_FOUND';
		public static const FAILED:String = 'FAILED';
		public static const START:String = 'START';
		public static const STOP:String = 'STOP';
		public static const BUFFER_FULL:String = 'BUFFER_FULL';
		public static const UNKNOWN:String = 'UNKNOWN';
		
		public static const PLAY_STREAM_STATUS_EVENT:String = 'PLAY_STREAM_STATUS_EVENT';
		
		public var status:String = UNKNOWN;
		
		public function PlayStreamStatusEvent(bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(PLAY_STREAM_STATUS_EVENT, bubbles, cancelable);
		}
		
	}
}
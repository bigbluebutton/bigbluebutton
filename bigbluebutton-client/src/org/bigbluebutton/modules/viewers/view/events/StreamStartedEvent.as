package org.bigbluebutton.modules.viewers.view.events
{
	import flash.events.Event;
	
	public class StreamStartedEvent extends Event
	{
		public static const STREAM_STARTED:String = "STREAM_STARTED";
		
		public var user:String;
		public var stream:String;
		
		public function StreamStartedEvent(user:String, stream:String)
		{
			this.user = user;
			this.stream = stream;
			super(STREAM_STARTED, true, false);
		}

	}
}
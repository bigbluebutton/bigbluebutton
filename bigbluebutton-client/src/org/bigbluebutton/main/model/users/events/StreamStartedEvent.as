package org.bigbluebutton.main.model.users.events
{
	import flash.events.Event;
	
	public class StreamStartedEvent extends Event
	{
		public static const STREAM_STARTED:String = "STREAM_STARTED";
		
		public var user:String;
		public var stream:String;
		public var userid:Number
		
		public function StreamStartedEvent(userid:Number, user:String, stream:String)
		{
			this.userid = userid;
			this.user = user;
			this.stream = stream;
			super(STREAM_STARTED, true, false);
		}

	}
}
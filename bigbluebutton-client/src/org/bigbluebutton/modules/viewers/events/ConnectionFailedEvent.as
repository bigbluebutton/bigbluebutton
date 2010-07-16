package org.bigbluebutton.modules.viewers.events
{
	import flash.events.Event;

	public class ConnectionFailedEvent extends Event
	{
		public static const UNKNOWN_REASON:String = "UNKNOWN_REASON";
		public static const CONNECTION_FAILED:String = "CONNECTION_FAILED";
		public static const CONNECTION_CLOSED:String = "CONNECTION_CLOSED";
		public static const INVALID_APP:String = "INVALID_APP";
		public static const APP_SHUTDOWN:String = "APP_SHUTDOWN";
		public static const CONNECTION_REJECTED:String = "CONNECTION_REJECTED";
		public static const ASYNC_ERROR:String = "ASYNC_ERROR";
		
		public static const CONNECTION_LOST:String = "CONNECTION_LOST";
		
		public var reason:String;
		
		public function ConnectionFailedEvent()
		{
			super(CONNECTION_LOST, true, false);
		}
	}
}
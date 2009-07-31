package org.bigbluebutton.core.events
{
	import flash.events.Event;

	public class ConnectionStatusEvent extends Event
	{
		public static const SUCCESS:String = 'SUCCESS';
		public static const FAILED:String = 'FAILED';
		public static const CLOSED:String = 'CLOSED';
		public static const REJECTED:String = 'REJECTED';
		public static const UNKNOWN:String = 'UNKNOWN';
		
		public static const CONNECTION_STATUS_EVENT:String = 'CONNECTION_STATUS_EVENT';
		
		public var status:String = 'UNKNOWN';
		public var reason:String = 'unknown';
		
		public function ConnectionStatusEvent(bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(CONNECTION_STATUS_EVENT, bubbles, cancelable);
		}
		
	}
}
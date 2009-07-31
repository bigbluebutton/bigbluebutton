package org.bigbluebutton.core.events
{
	import flash.events.Event;

	public class ConnectFailedEvent extends Event
	{
		
		public static const CONNECT_FAILED_EVENT:String = 'CONNECT_FAILED_EVENT';
		
		public var reason:String;
				
		public function ConnectFailedEvent(bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(CONNECT_FAILED_EVENT, bubbles, cancelable);
		}
		
	}
}
package org.bigbluebutton.core.events
{
	import flash.events.Event;

	public class ConnectSuccessEvent extends Event
	{		
		public static const CONNECT_SUCCESS_EVENT:String = 'CONNECT_SUCCESS_EVENT';
				
		public function ConnectSuccessEvent(bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(CONNECT_SUCCESS_EVENT, bubbles, cancelable);
		}
		
	}
}
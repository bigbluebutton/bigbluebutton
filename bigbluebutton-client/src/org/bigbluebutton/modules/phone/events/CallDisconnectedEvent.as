package org.bigbluebutton.modules.phone.events
{
	import flash.events.Event;

	public class CallDisconnectedEvent extends Event
	{
		public static const CALL_DISCONNECTED_EVENT:String = 'CALL_DISCONNECTED_EVENT';
		
		public function CallDisconnectedEvent(bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(CALL_DISCONNECTED_EVENT, bubbles, cancelable);
		}
		
	}
}
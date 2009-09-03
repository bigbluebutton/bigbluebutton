package org.bigbluebutton.modules.viewers.events
{
	import flash.events.Event;

	public class JoinFailedEvent extends Event
	{
		public static const JOIN_FAILED_EVENT:String = "JOIN_FAILED_EVENT";
		
		public function JoinFailedEvent(bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(JOIN_FAILED_EVENT, bubbles, cancelable);
		}
		
	}
}
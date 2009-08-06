package org.bigbluebutton.modules.phone.events
{
	import flash.events.Event;

	public class CallConnectedEvent extends Event
	{
		public static const CALL_CONNECTED_EVENT:String = 'CALL_CONNECTED_EVENT';
		
		public var publishStreamName:String;
		public var playStreamName:String;
		
		public function CallConnectedEvent(bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(CALL_CONNECTED_EVENT, bubbles, cancelable);
		}
		
	}
}
package org.bigbluebutton.modules.chat.events
{
	import flash.events.Event;

	public class ConnectionEvent extends Event
	{
		public static const CONNECT_EVENT:String = 'CONNECT_SUCCESS_EVENT';
		public var success:Boolean = false;
		public var errors:Array;
		
		public function ConnectionEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}
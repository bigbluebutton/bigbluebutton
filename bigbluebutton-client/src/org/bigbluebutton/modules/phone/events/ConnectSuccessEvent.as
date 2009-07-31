package org.bigbluebutton.modules.phone.events
{
	import flash.events.Event;

	public class ConnectSuccessEvent extends Event
	{
		
		public static const CONNECT_SUCCESS_EVENT:String = 'CONNECT_SUCCESS_EVENT';
		
		public function ConnectSuccessEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}
package org.bigbluebutton.common.mate
{
	import flash.events.Event;
	
	public class NetConnectionEvent extends Event
	{
		public static const NET_CONNECTION_CALL_SUCCESS:String = "NET_CONNECTION_CALL_SUCCESS";
		public static const NET_CONNECTION_CALL_FAILED:String = "NET_CONNECTION_CALL_FAILED";
		
		public var message:Object;
		
		public function NetConnectionEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false)
		{
			super(type, bubbles, cancelable);
		}

	}
}
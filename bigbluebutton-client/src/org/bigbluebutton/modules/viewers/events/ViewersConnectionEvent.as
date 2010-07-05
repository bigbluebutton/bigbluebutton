package org.bigbluebutton.modules.viewers.events
{
	import flash.events.Event;
	import flash.net.NetConnection;

	public class ViewersConnectionEvent extends Event
	{
		public static const CONNECTION_SUCCESS:String = "VIEWERS_CONNECTION_SUCCESS";
		
		public var connection:NetConnection;
		
		public function ViewersConnectionEvent(type:String)
		{
			super(type, true, false);
		}
	}
}
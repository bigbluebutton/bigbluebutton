package org.bigbluebutton.main.model.users.events
{
	import flash.events.Event;
	import flash.net.NetConnection;

	public class UsersConnectionEvent extends Event
	{
		public static const CONNECTION_SUCCESS:String = "usersConnectionSuccess";
		
		public var connection:NetConnection;
		public var userid:Number;
		
		public function UsersConnectionEvent(type:String)
		{
			super(type, true, false);
		}
	}
}
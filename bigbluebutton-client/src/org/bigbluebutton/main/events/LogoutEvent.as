package org.bigbluebutton.main.events
{
	import flash.events.Event;

	public class LogoutEvent extends Event
	{
		public static const USER_LOGGED_OUT:String = "USER_LOGGED_OUT";
		public static const DISCONNECT_TEST:String = "disconnect_test";
		public static const USER_KICKED_OUT:String = "USER_KICKED_OUT";
		
		public function LogoutEvent(type:String)
		{
			super(type, true, false);
		}
	}
}
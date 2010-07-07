package org.bigbluebutton.main.events
{
	import flash.events.Event;

	public class LoginEvent extends Event
	{
		public static const LOGIN_SUCCESS:String = "LOGIN_SUCCESS";
		
		public var user:Object;
		
		public function LoginEvent(type:String)
		{
			super(type, true, false);
		}
	}
}
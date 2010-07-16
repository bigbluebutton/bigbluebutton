package org.bigbluebutton.modules.viewers.events
{
	import flash.events.Event;

	public class LoginSuccessEvent extends Event
	{
		public static const LOGIN_SUCCESS:String = "LOGIN_SUCCESS_EVENT_RECEIVED";
		
		public var user:Object;
		
		public function LoginSuccessEvent(type:String)
		{
			super(type, true, false);
		}
	}
}
package org.blindside.modules.autotest.events
{
	import flash.events.Event;
	
	public class LoginTestEvent extends Event
	{
		public static const LOGIN_TEST:String = "loginTest";
		
		public function LoginTestEvent(type:String = LOGIN_TEST)
		{
			super(type, false, false);
		}

	}
}
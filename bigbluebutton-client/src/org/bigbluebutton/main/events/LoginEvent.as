package org.bigbluebutton.main.events
{
	import flash.events.Event;

	public class LoginEvent extends Event
	{
		public static const LOGIN_EVENT:String = 'loginEvent';
		
		public function LoginEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}
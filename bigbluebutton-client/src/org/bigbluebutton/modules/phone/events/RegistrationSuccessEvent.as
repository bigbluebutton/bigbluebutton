package org.bigbluebutton.modules.phone.events
{
	import flash.events.Event;

	public class RegistrationSuccessEvent extends Event
	{
		public static const REGISTRATION_SUCCESS_EVENT:String = 'REGISTRATION_SUCCESS_EVENT';
		
		public function RegistrationSuccessEvent(bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(REGISTRATION_SUCCESS_EVENT, bubbles, cancelable);
		}
		
	}
}
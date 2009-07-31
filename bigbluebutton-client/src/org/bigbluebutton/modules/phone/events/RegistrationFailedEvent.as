package org.bigbluebutton.modules.phone.events
{
	import flash.events.Event;

	public class RegistrationFailedEvent extends Event
	{
		public static const REGISTRATION_FAILED_EVENT:String = 'REGISTRATION_FAILED_EVENT';
		
		public function RegistrationFailedEvent(bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(REGISTRATION_FAILED_EVENT, bubbles, cancelable);
		}
		
	}
}
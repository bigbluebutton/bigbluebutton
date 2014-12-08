package org.bigbluebutton.modules.phone.events
{
	import flash.events.Event;
	
	public class FlashEchoTestFailedEvent extends Event
	{
		public static const ECHO_TEST_FAILED:String = "flash echo test failed event";
		
		public function FlashEchoTestFailedEvent()
		{
			super(ECHO_TEST_FAILED, true, false);
		}
	}
}
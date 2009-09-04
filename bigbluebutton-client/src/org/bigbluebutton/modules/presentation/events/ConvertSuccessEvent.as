package org.bigbluebutton.modules.presentation.events
{
	import flash.events.Event;

	public class ConvertSuccessEvent extends Event
	{
		public static const CONVERT_SUCCESS_EVENT:String = 'CONVERT_SUCCESS_EVENT';
		
		public function ConvertSuccessEvent(bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(CONVERT_SUCCESS_EVENT, bubbles, cancelable);
		}
		
	}
}
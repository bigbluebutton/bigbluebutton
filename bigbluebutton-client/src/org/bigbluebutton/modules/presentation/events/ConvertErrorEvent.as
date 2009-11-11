package org.bigbluebutton.modules.presentation.events
{
	import flash.events.Event;

	public class ConvertErrorEvent extends Event
	{
		public static const CONVERT_ERROR_EVENT:String = 'CONVERT_ERROR_EVENT';
		
		public function ConvertErrorEvent(bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(CONVERT_ERROR_EVENT, bubbles, cancelable);
		}
		
	}
}
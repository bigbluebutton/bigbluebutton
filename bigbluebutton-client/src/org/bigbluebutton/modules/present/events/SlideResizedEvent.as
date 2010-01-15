package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;

	public class SlideResizedEvent extends Event
	{
		public static const SLIDE_RESIZED_EVENT:String = "SLIDE RESIZED EVENT";
		
		public var percent:Number = 100;
		
		public function SlideResizedEvent()
		{
			super(SLIDE_RESIZED_EVENT, true, false);
		}
		
	}
}
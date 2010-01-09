package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;

	public class DisplaySlideEvent extends Event
	{
		public static const DISPLAY_SLIDE_EVENT:String = "DISPLAY_SLIDE_EVENT";
		public var slideWidth:int = 0;
		public var slideHeight:int = 0;
		
		public function DisplaySlideEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=true)
		{
			super(type, bubbles, cancelable);
		}		
	}
}
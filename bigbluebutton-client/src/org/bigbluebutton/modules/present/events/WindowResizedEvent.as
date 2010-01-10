package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;

	public class WindowResizedEvent extends Event
	{
		public static const PRESENTATION_WINDOW_RESIZED_EVENT:String = "PRESENTATION_WINDOW_RESIZED_EVENT";
		public var width:int = 450;
		public var height:int = 450;
		
		public function WindowResizedEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=true)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}
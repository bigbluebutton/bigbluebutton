package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;
	import flash.utils.ByteArray;
	
	public class SlideEvent extends Event
	{
		public static const SLIDE_LOADED:String = "Slide Loaded";
		public static const LOAD_CURRENT_SLIDE:String = "Load Current Slide";
		
		public var slideNumber:Number;
		public var slide:ByteArray;
		
		public function SlideEvent(type:String)
		{
			super(type, true, false);
		}

	}
}
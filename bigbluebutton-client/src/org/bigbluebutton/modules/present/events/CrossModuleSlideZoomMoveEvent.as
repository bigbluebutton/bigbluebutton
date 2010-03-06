package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;
	
	public class CrossModuleSlideZoomMoveEvent extends Event
	{
		public static const SLIDE_MOVE:String = "Slide Move";
		public static const SLIDE_ZOOM:String = "Slide Zoom";
		
		public var x:int;
		public var y:int;
		
		public function CrossModuleSlideZoomMoveEvent(type:String)
		{
			super(type, true, false);
		}

	}
}
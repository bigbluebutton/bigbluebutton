package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;
	
	public class ZoomEvent extends Event
	{
		public static const ZOOM:String = "ZOOM";
		public static const MAXIMIZE:String = "MAXIMIZE";
		public static const RESTORE:String = "RESTORE";
		
		public var slideWidth:Number;
		public var slideHeight:Number;
		
		public function ZoomEvent(type:String)
		{
			super(type, true, false);
		}

	}
}
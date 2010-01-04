package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;
	
	public class CursorEvent extends Event
	{
		public static const UPDATE_CURSOR:String = "UPDATE_CURSOR";
		
		public var xPercent:Number;
		public var yPercent:Number;
		
		public function CursorEvent(type:String)
		{
			super(type, true, false);
		}

	}
}
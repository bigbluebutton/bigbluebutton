package org.bigbluebutton.modules.deskShare.events
{
	import flash.events.Event;

	public class CursorEvent extends Event
	{
		public static const UPDATE_CURSOR_LOC_EVENT:String = "Update sharer cursor event";
		
		public var x:Number = 0;
		public var y:Number = 0;
		
		public function CursorEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}
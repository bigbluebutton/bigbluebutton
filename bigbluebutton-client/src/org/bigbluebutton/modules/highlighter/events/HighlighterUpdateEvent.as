package org.bigbluebutton.modules.highlighter.events
{
	import flash.events.Event;
	
	public class HighlighterUpdateEvent extends Event
	{
		public static const BOARD_UPDATED:String = "boardUpdated";
		public static const BOARD_CLEARED:String = "boardClear";
		public static const SHAPE_UNDONE:String = "shapeUndone";
		
		public var message:Object;
		
		public function HighlighterUpdateEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false)
		{
			super(type, bubbles, cancelable);
		}

	}
}
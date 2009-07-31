package org.bigbluebutton.modules.highlighter.events
{
	import flash.events.Event;
	
	public class HighlighterDrawEvent extends Event
	{
		public static const SEND_SHAPE:String = "sendShape";
		public static const CLEAR_BOARD:String = "clearBoard";
		public static const UNDO_SHAPE:String = "undoShape"
		
		public var message:Object;
		
		public function HighlighterDrawEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false)
		{
			super(type, bubbles, cancelable);
		}

	}
}
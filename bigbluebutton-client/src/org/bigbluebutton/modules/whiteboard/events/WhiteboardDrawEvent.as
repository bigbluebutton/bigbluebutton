package org.bigbluebutton.modules.whiteboard.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
	
	public class WhiteboardDrawEvent extends Event
	{
		public static const SEND_SHAPE:String = "sendShape";
		public static const CLEAR_BOARD:String = "clearBoard";
		public static const UNDO_SHAPE:String = "undoShape"
		
		public var message:DrawObject;
		
		public function WhiteboardDrawEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false)
		{
			super(type, bubbles, cancelable);
		}

	}
}
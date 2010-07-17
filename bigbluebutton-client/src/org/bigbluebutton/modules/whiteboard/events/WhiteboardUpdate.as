package org.bigbluebutton.modules.whiteboard.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
	
	public class WhiteboardUpdate extends Event
	{
		public static const BOARD_UPDATED:String = "boardUpdated";
		public static const BOARD_CLEARED:String = "boardClear";
		public static const SHAPE_UNDONE:String = "shapeUndone";
		public static const BOARD_ENABLED:String = "boardEnabled";
			
		public var data:DrawObject;
		public var boardEnabled:Boolean;
		
		public function WhiteboardUpdate(type:String)
		{
			super(type, true, false);
		}

	}
}
package org.bigbluebutton.modules.highlighter.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.highlighter.business.shapes.DrawObject;
	
	public class HighlighterUpdate extends Event
	{
		public static const BOARD_UPDATED:String = "boardUpdated";
		public static const BOARD_CLEARED:String = "boardClear";
		public static const SHAPE_UNDONE:String = "shapeUndone";
			
		public var data:DrawObject;
		
		public function HighlighterUpdate(type:String)
		{
			super(type, true, false);
		}

	}
}
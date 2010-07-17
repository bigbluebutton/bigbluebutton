package org.bigbluebutton.modules.whiteboard.events
{
	import flash.events.Event;
	
	public class WhiteboardPresenterEvent extends Event
	{
		public static const MODIFY_ENABLED:String = "EnableHighlighterEvent";
		
		public var enabled:Boolean;
		
		public function WhiteboardPresenterEvent(type:String)
		{
			super(type, true, false);
		}

	}
}
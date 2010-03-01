package org.bigbluebutton.modules.highlighter.events
{
	import flash.events.Event;
	
	public class HighlighterPresenterEvent extends Event
	{
		public static const MODIFY_ENABLED:String = "EnableHighlighterEvent";
		
		public var enabled:Boolean;
		
		public function HighlighterPresenterEvent(type:String)
		{
			super(type, true, false);
		}

	}
}
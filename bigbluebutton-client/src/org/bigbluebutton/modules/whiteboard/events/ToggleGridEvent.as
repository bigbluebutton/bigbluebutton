package org.bigbluebutton.modules.whiteboard.events
{
	import flash.events.Event;
	
	public class ToggleGridEvent extends Event
	{
		public static const TOGGLE_GRID:String = "toggleGrid";
		public static const GRID_TOGGLED:String = "gridToggled";
		
		public function ToggleGridEvent(type:String)
		{
			super(type, true, false);
		}
	}
}
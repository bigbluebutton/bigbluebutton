package org.bigbluebutton.main.events
{
	import flash.events.Event;

	public class ToolbarButtonEvent extends Event
	{
		public static const ADD:String = "Add Toolbar Button Event";
		public static const REMOVE:String = "Remove Toolbar Button Event";
		
		public var button:Button;
		
		public function ToolbarButtonEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}
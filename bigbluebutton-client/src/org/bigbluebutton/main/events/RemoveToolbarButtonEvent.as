package org.bigbluebutton.main.events
{
	import flash.events.Event;
	
	import mx.controls.Button;

	public class RemoveToolbarButtonEvent extends Event
	{
		public var button:Button;
		
		public static const REMOVE_TOOLBAR_BUTTON_EVENT:String = 'REMOVE_TOOLBAR_BUTTON_EVENT';
		
		public function RemoveToolbarButtonEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}
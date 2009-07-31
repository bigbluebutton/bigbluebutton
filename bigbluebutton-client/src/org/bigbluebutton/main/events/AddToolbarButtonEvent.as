package org.bigbluebutton.main.events
{
	import flash.events.Event;
	
	import mx.controls.Button;

	public class AddToolbarButtonEvent extends Event
	{
		public var button:Button;
		
		public static const ADD_TOOLBAR_BUTTON_EVENT:String = 'ADD_TOOLBAR_BUTTON_EVENT';
		
		public function AddToolbarButtonEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}
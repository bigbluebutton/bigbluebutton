package org.bigbluebutton.core.controllers.events
{
	import flash.events.Event;
	
	public class SwitchPresenterEvent extends Event
	{
		public static const SWITCH_PRESENTER_EVENT:String = "switch presenter event";
		
		public var newPresenter:String;
		public var oldPresenter:String;
		public var assignedBy:String;
		
		public function SwitchPresenterEvent(bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(SWITCH_PRESENTER_EVENT, bubbles, cancelable);
		}
	}
}
package org.bigbluebutton.main.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.common.IBbbModuleWindow;

	public class CloseWindowEvent extends Event
	{
		public var window:IBbbModuleWindow;
		
		public static const CLOSE_WINDOW_EVENT:String = 'CLOSE_WINDOW_EVENT';
		
		public function CloseWindowEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}
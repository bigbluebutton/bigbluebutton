package org.bigbluebutton.main.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.common.IBbbModuleWindow;

	public class OpenWindowEvent extends Event
	{
		public var window:IBbbModuleWindow;
		
		public static const OPEN_WINDOW_EVENT:String = 'OPEN_WINDOW_EVENT';
		
		public function OpenWindowEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}
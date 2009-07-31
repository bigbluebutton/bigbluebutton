package org.bigbluebutton.main.events
{
	import flash.events.Event;

	public class ModuleStartedEvent extends Event
	{
		public static const MODULE_STARTED_EVENT:String = 'MODULE_STARTED_EVENT';
		
		public var started:Boolean = false;
		public var moduleName:String = '';
		
		public function ModuleStartedEvent(bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(MODULE_STARTED_EVENT, bubbles, cancelable);
		}
		
	}
}
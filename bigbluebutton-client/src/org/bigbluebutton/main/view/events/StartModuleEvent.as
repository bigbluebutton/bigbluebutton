package org.bigbluebutton.main.view.events
{
	import flash.events.Event;

	public class StartModuleEvent extends Event
	{
		public static const START_MODULE_RETRY_EVENT:String = "START_MODULE_RETRY_EVENT";
		public var moduleName:String;
		
		public function StartModuleEvent(moduleName:String)
		{
			super(START_MODULE_RETRY_EVENT, true);
			this.moduleName = moduleName;
		}
		
	}
}
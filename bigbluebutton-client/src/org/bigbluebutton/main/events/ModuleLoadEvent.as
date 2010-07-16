package org.bigbluebutton.main.events
{
	import flash.events.Event;

	public class ModuleLoadEvent extends Event
	{
		public static const MODULE_LOAD_PROGRESS:String = "MODULE_LOAD_PROGRESS";
		public static const MODULE_LOAD_READY:String = "MODULE_LOAD_READY";
		public static const ALL_MODULES_LOADED:String = "ALL_MODULES_LOADED";
		
		public var moduleName:String;
		public var progress:Number;
		
		public function ModuleLoadEvent(type:String)
		{
			super(type, true, false);
		}
	}
}
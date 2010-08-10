package org.bigbluebutton.main.events
{
	import flash.events.Event;

	public class ModuleLoadEvent extends Event
	{
		public static const MODULE_LOAD_PROGRESS:String = "MODULE_LOAD_PROGRESS";
		public static const MODULE_LOAD_READY:String = "MODULE_LOAD_READY";
		public static const ALL_MODULES_LOADED:String = "ALL_MODULES_LOADED";
		public static const MODULE_LOADING_STARTED:String = "MODULE_LOADING_START";
		
		public var moduleName:String;
		public var progress:Number;
		public var numModules:int;
		
		public function ModuleLoadEvent(type:String)
		{
			super(type, true, false);
		}
	}
}
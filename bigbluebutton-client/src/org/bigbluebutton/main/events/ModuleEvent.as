package org.bigbluebutton.main.events
{
	import flash.events.Event;

	public class ModuleEvent extends Event
	{
		public static const MODULE_LOADED_EVENT:String = 'moduleLoadedEvent';
		public static const MODULE_LOAD_PROGRESS_EVENT:String = 'moduleLoadProgressEvent';
		public static const MODULE_LOAD_ERROR_EVENT:String = 'moduleLoadErrorEvent';
		public static const ALL_MODULES_LOADED_EVENT:String = 'allModulesLoadedEvent';
				
		public var moduleName:String;
		public var message:String;
		public var percentLoaded:Number;
		
		public function ModuleEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}		
	}
}
package org.bigbluebutton.modules.listeners.events
{
	import flash.events.Event;
	
	public class StartListenersModuleEvent extends Event
	{
		public static const START_LISTENERS_MODULE:String = "Start_Listeners_Module";
		
		public var module:ListenersModule;
		
		public function StartListenersModuleEvent(type:String)
		{
			super(type, true, false);
		}
	}
}
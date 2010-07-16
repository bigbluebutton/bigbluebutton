package org.bigbluebutton.modules.listeners.events
{
	import flash.events.Event;

	public class StopListenersModuleEvent extends Event
	{
		public static const STOP_LISTENERS_MODULE:String = "Stop_Listeners_Module";
		public static const DISCONNECTED:String = "Module Disconnected";
		
		public var manual_disconnect:Boolean;
		
		public function StopListenersModuleEvent(type:String)	
		{
			super(type, true, false);
		}
	}
}
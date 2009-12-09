package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;
	
	public class PresentModuleEvent extends Event
	{
		public static const START_MODULE:String = "START_MODULE";
		public static const STOP_MODULE:String = "STOP_MODULE";
		
		public var data:Object;
		
		public function PresentModuleEvent(type:String)
		{
			super(type, true, false);
		}

	}
}
package org.bigbluebutton.modules.breakout.events
{
	import flash.events.Event;

	public class StartBreakoutModule extends Event
	{
		public static const START_BREAKOUT:String = "START_BREAKOUT";
		
		public var attributes:Object;
		
		public function StartBreakoutModule(type:String)
		{
			super(type, true, false);
		}
	}
}
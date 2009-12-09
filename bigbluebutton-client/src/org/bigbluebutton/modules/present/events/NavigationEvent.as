package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;
	
	public class NavigationEvent extends Event
	{
		public static const GOTO_PAGE:String = "GOTO_PAGE";
		
		public var pageNumber:Number;
		
		public function NavigationEvent(type:String)
		{
			super(type, true, false);
		}

	}
}
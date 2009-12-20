package org.bigbluebutton.main.events
{
	import flash.events.Event;
	
	public class PresenterStatusEvent extends Event
	{
		public static const PRESENTER_NAME_CHANGE:String = "PRESENTER_NAME_CHANGE";
		public static const SWITCH_TO_VIEWER_MODE:String = "VIEWER_MODE";
		public static const SWITCH_TO_PRESENTER_MODE:String = "PRESENTER_MODE";
		
		public var presenterName:String;
		public var assignerBy:Number;
		public var userid:Number;
		
		public function PresenterStatusEvent(type:String)
		{
			super(type, true, false);
		}

	}
}
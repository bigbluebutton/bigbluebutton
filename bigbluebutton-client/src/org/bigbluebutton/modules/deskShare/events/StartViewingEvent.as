package org.bigbluebutton.modules.deskShare.events
{
	import flash.events.Event;
	
	public class StartViewingEvent extends Event
	{
		public static const START_VIEWING:String = "StartViewingEvent";
		
		public var width:Number;
		public var height:Number;
		
		public function StartViewingEvent(type:String = START_VIEWING)
		{
			super(type, true, false);
		}

	}
}
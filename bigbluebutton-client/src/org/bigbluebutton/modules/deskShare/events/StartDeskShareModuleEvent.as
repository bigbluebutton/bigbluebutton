package org.bigbluebutton.modules.deskShare.events
{
	import flash.events.Event;
	
	public class StartDeskShareModuleEvent extends Event
	{
		public static const START_DESK_SHARE:String = "StartDeskShareModuleEvent";
		
		public function StartDeskShareModuleEvent(type:String = START_DESK_SHARE)
		{
			super(type, true, false);
		}

	}
}
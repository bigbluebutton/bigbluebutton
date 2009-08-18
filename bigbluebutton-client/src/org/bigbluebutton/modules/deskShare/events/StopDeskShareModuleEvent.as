package org.bigbluebutton.modules.deskShare.events
{
	import flash.events.Event;
	
	public class StopDeskShareModuleEvent extends Event
	{
		public static const STOP_DESK_SHARE_MODULE:String = "StopDeskShareModule";
		
		public function StopDeskShareModuleEvent(type:String = STOP_DESK_SHARE_MODULE)
		{
			super(type, true, false);
		}

	}
}
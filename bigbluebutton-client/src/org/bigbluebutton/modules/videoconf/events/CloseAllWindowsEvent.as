package org.bigbluebutton.modules.videoconf.events
{
	import flash.events.Event;
	
	public class CloseAllWindowsEvent extends Event
	{
		public static const CLOSE_ALL_WINDOWS:String = "CLOSE_ALL_WINDOWS";
		
		public function CloseAllWindowsEvent(type:String = CLOSE_ALL_WINDOWS)
		{
			super(type, true, false);
		}

	}
}
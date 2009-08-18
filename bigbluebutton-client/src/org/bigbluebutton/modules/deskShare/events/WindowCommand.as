package org.bigbluebutton.modules.deskShare.events
{
	import flash.events.Event;
	
	public class WindowCommand extends Event
	{
		public static const OPEN:String = "OpenWindow";
		public static const CLOSE:String = "CloseWindow";
		
		public function WindowCommand(type:String)
		{
			super(type, true, false);
		}

	}
}
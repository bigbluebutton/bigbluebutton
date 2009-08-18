package org.bigbluebutton.modules.deskShare.events
{
	import flash.events.Event;
	
	public class AppletStartedEvent extends Event
	{
		public static const APPLET_STARTED:String = "AppletStartedEvent";
		
		public function AppletStartedEvent(type:String = APPLET_STARTED)
		{
			super(type, true, false);
		}

	}
}
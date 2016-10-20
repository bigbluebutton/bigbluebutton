package org.bigbluebutton.modules.screenshare.events
{
	import flash.events.Event;
	
	public class ScreenshareAppletLaunchedEvent extends Event
	{
		public static const APPLET_LAUNCHED:String = "SCREENSHARE APPLET LAUNCHED EVENT";
		
		public function ScreenshareAppletLaunchedEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
	}
}
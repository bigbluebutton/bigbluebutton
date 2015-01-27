package org.bigbluebutton.modules.deskshare.events
{
	import flash.events.Event;
	
	public class DeskshareAppletLaunchedEvent extends Event
	{
		public static const APPLET_LAUNCHED:String = "DESKSHARE_APPLET_LAUNCHED_EVENT";
		
		public function DeskshareAppletLaunchedEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
	}
}
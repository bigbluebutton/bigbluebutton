package org.bigbluebutton.main.events
{
	import flash.events.Event;

	public class AppVersionEvent extends Event
	{
		public var appVersion:String;
		public static const APP_VERSION_EVENT:String = "APP VERSION EVENT";
		
		public function AppVersionEvent()
		{
			super(APP_VERSION_EVENT, true, false);
		}
		
	}
}
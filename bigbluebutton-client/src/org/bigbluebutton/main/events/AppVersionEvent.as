package org.bigbluebutton.main.events
{
	import flash.events.Event;

	public class AppVersionEvent extends Event
	{
		
		public static const APP_VERSION_EVENT:String = "APP VERSION EVENT";
		public var appVersion:String;
		public var localVersion:String;
		public var suppressLocaleWarning:Boolean;
		
		public function AppVersionEvent()
		{
			super(APP_VERSION_EVENT, true, false);
		}
		
	}
}
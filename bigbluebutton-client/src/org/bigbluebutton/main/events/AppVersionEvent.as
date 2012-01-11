package org.bigbluebutton.main.events
{
	import flash.events.Event;

	public class AppVersionEvent extends Event {		
		public static const APP_VERSION_EVENT:String = "APP VERSION EVENT";
		public var appVersion:String;
		public var localeVersion:String;
		public var suppressLocaleWarning:Boolean = false;
		// If this version is from config.xml (true) or from locale.swf (false)
		public var configLocaleVersion:Boolean = false;
		
		public function AppVersionEvent()
		{
			super(APP_VERSION_EVENT, true, false);
		}
		
	}
}
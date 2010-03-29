package org.bigbluebutton.main.events
{
	import flash.events.Event;

	public class ConfigurationEvent extends Event
	{
		public static const CONFIG_EVENT:String = "Configuration Event";
		
		public var helpURL:String;
		
		public function ConfigurationEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}
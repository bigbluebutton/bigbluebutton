package org.bigbluebutton.main.events
{
	import flash.events.Event;
	
	public class ConfigLoadedEvent extends Event
	{
		public static const CONFIG_LOADED_EVENT:String = "config loaded event";
		
		public function ConfigLoadedEvent()
		{
			super(CONFIG_LOADED_EVENT, true, false);
		}
	}
}
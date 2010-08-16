package org.bigbluebutton.main.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.main.model.ConfigParameters;

	public class ConfigEvent extends Event
	{
		public static const CONFIG_EVENT:String = "config event";
		
		public var config:ConfigParameters;
		
		public function ConfigEvent(type:String)
		{
			super(type, true, false);
		}
	}
}
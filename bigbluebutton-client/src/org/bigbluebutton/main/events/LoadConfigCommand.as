package org.bigbluebutton.main.events
{
	import flash.events.Event;
	
	public class LoadConfigCommand extends Event
	{
		
		public static const LOAD_CONFIG_COMMAND:String = "load config command";
		
		public function LoadConfigCommand()
		{
			super(LOAD_CONFIG_COMMAND, true, false);
		}
	}
}
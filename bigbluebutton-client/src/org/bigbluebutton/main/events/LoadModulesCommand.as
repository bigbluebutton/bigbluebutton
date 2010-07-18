package org.bigbluebutton.main.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.main.model.ConferenceParameters;

	public class LoadModulesCommand extends Event
	{
		public static const LOAD_MODULES:String = "LoadAllModules";
		
		public var conferenceParameters:ConferenceParameters;
		
		public function LoadModulesCommand(type:String)
		{
			super(type, true, false);
		}
	}
}
package org.bigbluebutton.main.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.main.model.ConferenceParameters;
	import org.bigbluebutton.main.model.users.BBBUser;
	
	public class ModuleCommand extends Event
	{
		public static const NEW_COMMAND:String = "NewModuleCommand";
		
		public var module:String;
		public var command:String;		
		
		public function ModuleCommand(type:String)
		{
			super(type, true, false);
		}
	}
}
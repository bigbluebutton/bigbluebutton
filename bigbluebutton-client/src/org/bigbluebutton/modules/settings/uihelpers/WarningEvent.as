package org.bigbluebutton.modules.settings.uihelpers
{
	import flash.events.Event;

	public class WarningEvent extends Event
	{
		public static const WARNING_EVENT:String = "BBB_CHECKER_WARNING";
		
		public var warningLabel:String;
		public var warningText:String;
		public var optionalCommandText:String;
		public var optionalCallbackFunction:Function;
		
		public function WarningEvent(type:String)
		{
			super(type, true, false);
		}
	}
}
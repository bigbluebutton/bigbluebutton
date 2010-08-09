package org.bigbluebutton.modules.viewers.events
{
	import flash.events.Event;

	public class ViewersModuleStartedEvent extends Event
	{
		public static const VIEWERS_MODULE_STARTED:String = "VIEWERS_MODULE_STARTED";
		
		public var module:ViewersModule;
		public var allowKickUser:Boolean;
		
		public function ViewersModuleStartedEvent(type:String)
		{
			super(type, true, false);
		}
	}
}
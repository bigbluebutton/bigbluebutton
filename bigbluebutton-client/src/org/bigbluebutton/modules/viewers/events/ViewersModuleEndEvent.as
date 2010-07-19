package org.bigbluebutton.modules.viewers.events
{
	import flash.events.Event;

	public class ViewersModuleEndEvent extends Event
	{
		public static const VIEWERS_MODULE_ENDED:String = "VIEWERS_MODULE_ENDED";
		
		public function ViewersModuleEndEvent(type:String)
		{
			super(type, true, false);
		}
	}
}
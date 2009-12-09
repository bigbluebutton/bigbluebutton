package org.bigbluebutton.modules.viewers.events
{
	import flash.events.Event;
	
	public class UserStatusEvent extends Event
	{
		public static const ASSIGN_PRESENTER:String = "ASSIGN_PRESENTER";
		
		public var data:Object;
		
		public function UserStatusEvent(type:String)
		{
			super(type, true, false);
		}

	}
}
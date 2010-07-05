package org.bigbluebutton.modules.viewers.events
{
	import flash.events.Event;

	public class RoleChangeEvent extends Event
	{
		public static const ASSIGN_PRESENTER:String = "ASSIGN_PRESENTER";
		
		public var userid:Number;
		public var username:String;
		
		public function RoleChangeEvent(type:String)
		{
			super(type, true, false);
		}
	}
}
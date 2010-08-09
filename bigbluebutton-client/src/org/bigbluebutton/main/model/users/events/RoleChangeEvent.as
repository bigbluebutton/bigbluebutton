package org.bigbluebutton.main.model.users.events
{
	import flash.events.Event;

	public class RoleChangeEvent extends Event
	{
		public static const ASSIGN_PRESENTER:String = "assignPresenter";
		
		public var userid:Number;
		public var username:String;
		
		public function RoleChangeEvent(type:String)
		{
			super(type, true, false);
		}
	}
}
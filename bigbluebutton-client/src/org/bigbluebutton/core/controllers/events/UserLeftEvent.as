package org.bigbluebutton.core.controllers.events
{
	import flash.events.Event;
	
	public class UserLeftEvent extends Event
	{
		public static const USER_LEFT_EVENT:String = "user left event";
		
		public var userId:String;
		public var name:String;
		
		public function UserLeftEvent(bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(USER_LEFT_EVENT, bubbles, cancelable);
		}
	}
}
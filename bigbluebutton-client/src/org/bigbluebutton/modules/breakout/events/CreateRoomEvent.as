package org.bigbluebutton.modules.breakout.events
{
	import flash.events.Event;

	public class CreateRoomEvent extends Event
	{
		public static const CREATE_ROOM:String = "Create Breakout Room";
		
		public var kickUsers:Boolean;
		public var usersList:Array;
		
		public function CreateRoomEvent(type:String)
		{
			super(type, true, false);
		}
	}
}
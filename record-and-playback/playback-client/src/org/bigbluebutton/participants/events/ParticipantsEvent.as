package org.bigbluebutton.participants.events
{
	import flash.events.Event;
	
	public class ParticipantsEvent extends Event
	{
		public static const JOIN_EVENT:String = 'JOIN_EVENT';
		public static const LEAVE_EVENT:String = 'LEAVE_EVENT';
		public static const STATUS_CHANGE_EVENT:String = 'STATUS_CHANGE_EVENT';
		
		public var userid:String;
		public var name:String;
		public var role:String;
		public var status:String;
		public var status_flag:Boolean;
		
		
		public function ParticipantsEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}
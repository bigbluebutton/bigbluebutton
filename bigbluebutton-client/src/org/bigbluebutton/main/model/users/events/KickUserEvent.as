package org.bigbluebutton.main.model.users.events
{
	import flash.events.Event;

	public class KickUserEvent extends Event
	{
		public static const KICK_USER:String = "KICK_USER";
		
		public var userid:Number;
		
		public function KickUserEvent(userid:Number)
		{
			this.userid = userid;
			super(KICK_USER, true, false);
		}
	}
}
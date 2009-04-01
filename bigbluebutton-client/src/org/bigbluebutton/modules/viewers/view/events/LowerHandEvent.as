package org.bigbluebutton.modules.viewers.view.events
{
	import flash.events.Event;

	public class LowerHandEvent extends Event
	{
		public static const LOWER_HAND_EVENT:String = "LOWER_HAND_EVENT";
		
		public var userid:Number;

		public function LowerHandEvent(userid:Number)
		{
			super(LOWER_HAND_EVENT,true);
			this.userid = userid;
		}
		
	}
}
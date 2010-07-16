package org.bigbluebutton.modules.viewers.events
{
	import flash.events.Event;

	public class RaiseHandEvent extends Event
	{
		public static const RAISE_HAND:String = "RAISE_HAND_EVENT";
		
		public var raised:Boolean;
		
		public function RaiseHandEvent(type:String)
		{
			super(type, true, false);
		}
	}
}
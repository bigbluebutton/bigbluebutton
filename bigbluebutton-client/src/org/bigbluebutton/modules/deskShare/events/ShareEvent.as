package org.bigbluebutton.modules.deskShare.events
{
	import flash.events.Event;

	public class ShareEvent extends Event
	{
		public static const START_SHARING:String = "START SHARING";
		public static const STOP_SHARING:String = "STOP SHARING";
		
		public function ShareEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}